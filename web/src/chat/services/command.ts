import {
  unstable_defaultDirectiveFormatter,
  type Unstable_SlashCommand,
  type Unstable_TriggerItem,
} from "@assistant-ui/react"

/** 输入指令写入后端扩展协议时使用的稳定类型。 */
export const PROMPT_INSTRUCTION_TYPE = {
  command: "command",
  skill: "skill",
} as const

/** Slash 指令面板支持的后端扩展类型。 */
type PromptInstructionType =
  (typeof PROMPT_INSTRUCTION_TYPE)[keyof typeof PROMPT_INSTRUCTION_TYPE]

/** 可由输入框选择并随 HumanMessage 发送给后端的指令或 Skill。 */
export interface PromptInstruction {
  /** 指令唯一标识。 */
  readonly id: string

  /** 指令写入后端扩展协议时使用的类型。 */
  readonly type: PromptInstructionType

  /** 指令标题。 */
  readonly title: string

  /** 指令描述。 */
  readonly description: string

  /** 指令补充内容；没有独立内容时使用 `null`。 */
  readonly content: string | null

  /** 交给后端执行的指令说明。 */
  readonly instructions?: string

  /** 指令需要携带的结构化附加数据。 */
  readonly payload?: unknown
}

/** 从消息正文中提取指令后的结果。 */
interface ResolvedCommandContent {
  /** 移除已识别指令 Token 后的用户正文。 */
  readonly content: string

  /** 需要写入 `additional_kwargs.extensions` 的指令和 Skill。 */
  readonly instructions: readonly PromptInstruction[]
}

/**
 * 临时用于预览 Slash Commands 交互和后端扩展协议的指令清单。
 *
 * 指令视觉和交互确认后删除这些 Mock 数据，再替换为真实指令数据源。
 * 导航、打开页面等纯前端操作不属于指令。
 */
const COMMAND_DEFINITIONS: readonly PromptInstruction[] = [
  {
    id: "summarize",
    type: "command",
    title: "总结对话",
    description: "提取当前对话的重点、结论和待办事项",
    content: null,
    instructions: "总结当前对话，按重点、结论和待办事项组织结果。",
  },
  {
    id: "plan",
    type: "command",
    title: "制定计划",
    description: "把当前目标拆分为清晰、可执行的步骤",
    content: null,
    instructions: "根据用户目标制定可执行计划，并标明步骤之间的依赖关系。",
  },
  {
    id: "explain",
    type: "command",
    title: "解释概念",
    description: "用容易理解的方式解释输入中的技术概念",
    content: null,
    instructions: "解释用户提到的概念，优先使用清晰定义和简短示例。",
  },
  {
    id: "review",
    type: "command",
    title: "审查内容",
    description: "检查内容中的问题、风险和改进空间",
    content: null,
    instructions: "审查用户提供的内容，指出具体问题、风险和改进建议。",
  },
  {
    id: "document-analysis",
    type: "skill",
    title: "文档分析",
    description: "分析附件或长文档并提取结构化要点",
    content: null,
    instructions: "分析用户提供的文档，提取结构、关键事实和待处理事项。",
  },
  {
    id: "deep-research",
    type: "skill",
    title: "深度研究",
    description: "围绕问题拆分研究方向并汇总证据",
    content: null,
    instructions: "拆分研究问题，整理相关证据，并标明结论与不确定性。",
  },
]

/** 将后端指令定义转换为 assistant-ui 可选择的触发项。 */
const toTriggerItem = (
  instruction: PromptInstruction
): Unstable_TriggerItem => ({
  id: instruction.id,
  type: instruction.type,
  label: `/${instruction.id} ${instruction.title}`,
  description: instruction.description,
})

/** 创建平铺搜索结果的 Slash 指令适配器，视觉分组由输入组件负责。 */
export const createCommandTriggerAdapter = () => ({
  categories: () => [],
  categoryItems: () => [],
  search: (query: string) => {
    const normalizedQuery = query.toLocaleLowerCase()

    return COMMAND_DEFINITIONS.filter(
      (instruction) =>
        instruction.id.toLocaleLowerCase().includes(normalizedQuery) ||
        instruction.title.toLocaleLowerCase().includes(normalizedQuery) ||
        instruction.description.toLocaleLowerCase().includes(normalizedQuery)
    ).map(toTriggerItem)
  },
})

/**
 * 交给 assistant-ui 官方 Slash Command 适配器的指令清单。
 *
 * `execute` 刻意不在选择时执行业务。指令会保留为输入框 Token，发送时再由
 * `fetch-handler` 写入 HumanMessage 的 `additional_kwargs.extensions`，交给后端执行。
 */
export const SLASH_COMMANDS: readonly Unstable_SlashCommand[] =
  COMMAND_DEFINITIONS.map((instruction) => ({
    id: instruction.id,
    label: `/${instruction.id} ${instruction.title}`,
    description: instruction.description,
    execute: () => undefined,
  }))

/** 从消息正文中移除已注册的指令 Token，并返回对应的后端指令模型。 */
export const resolveCommandContent = (
  content: string
): ResolvedCommandContent => {
  const instructions: PromptInstruction[] = []
  const resolvedContent = unstable_defaultDirectiveFormatter
    .parse(content)
    .map((segment) => {
      if (segment.kind === "text") return segment.text

      const serializedDirective = unstable_defaultDirectiveFormatter.serialize({
        id: segment.id,
        type: segment.type,
        label: segment.label,
      })
      if (segment.type !== "command" && segment.type !== "skill") {
        return serializedDirective
      }

      const instruction = COMMAND_DEFINITIONS.find(
        (item) => item.id === segment.id && item.type === segment.type
      )
      if (!instruction) return serializedDirective

      instructions.push(instruction)
      return ""
    })
    .join("")

  return { content: resolvedContent, instructions }
}
