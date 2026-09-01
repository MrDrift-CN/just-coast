import {
  resolveCommandContent,
  type PromptInstruction,
} from "@/chat/services/command"

/** 写入 LangChain `additional_kwargs.extensions` 的统一扩展模型。 */
interface Extension {
  /** 扩展唯一标识。 */
  readonly id: string

  /** 扩展标题。 */
  readonly title: string

  /** 扩展描述。 */
  readonly description: string

  /** 扩展类型。 */
  readonly type: "text" | "skill" | "command" | "file" | "image"

  /** 扩展内容。 */
  readonly content: string | null

  /** 文件扩展名。 */
  readonly extension?: string | null

  /** 文件或资源路径。 */
  readonly path?: string

  /** 扩展指令。 */
  readonly instructions?: string

  /** 扩展附加数据。 */
  readonly payload?: unknown
}

/** LangGraph 运行请求中的 HumanMessage。 */
interface LangGraphHumanMessage {
  /** LangChain 消息类型。 */
  readonly type: string

  /** 当前运行时发送的纯文本消息正文。 */
  readonly content: string

  /** LangChain 消息允许携带的附加参数。 */
  readonly additional_kwargs?: unknown
}

/** LangGraph 运行请求中包含消息的输入结构。 */
interface LangGraphRunInput {
  /** 本次运行追加到线程的消息。 */
  readonly messages?: unknown
}

/** LangGraph SDK 发出的运行请求体。 */
interface LangGraphRunRequestBody {
  /** 本次运行提交给图的输入。 */
  readonly input?: LangGraphRunInput

  /** SDK 可能附带的其他运行参数。 */
  readonly [key: string]: unknown
}

/** 将 Slash 指令领域模型转换为后端 `Extension` 协议。 */
const toPromptExtension = (instruction: PromptInstruction): Extension => ({
  id: instruction.id,
  title: instruction.title,
  description: instruction.description,
  type: instruction.type,
  content: instruction.content,
  ...(instruction.instructions !== undefined
    ? { instructions: instruction.instructions }
    : {}),
  ...(instruction.payload !== undefined
    ? { payload: instruction.payload }
    : {}),
})

/** 判断未知请求字段是否为当前协议能够转换的 HumanMessage。 */
const isLangGraphHumanMessage = (
  message: unknown
): message is LangGraphHumanMessage =>
  typeof message === "object" &&
  message !== null &&
  "type" in message &&
  message.type === "human" &&
  "content" in message &&
  typeof message.content === "string"

/** 把 HumanMessage 中已确定协议的 Slash 指令转换为后端扩展。 */
const transformLangGraphRequestBody = (body: string): string => {
  const requestBody = JSON.parse(body) as LangGraphRunRequestBody
  const messages = requestBody.input?.messages
  if (!Array.isArray(messages)) return body

  let hasInstruction = false
  const transformedMessages = messages.map((message: unknown) => {
    if (!isLangGraphHumanMessage(message)) return message

    const resolved = resolveCommandContent(message.content)
    if (resolved.instructions.length === 0) return message

    hasInstruction = true
    const additionalKwargs =
      typeof message.additional_kwargs === "object" &&
      message.additional_kwargs !== null &&
      !Array.isArray(message.additional_kwargs)
        ? (message.additional_kwargs as Readonly<Record<string, unknown>>)
        : {}
    const existingExtensions: readonly unknown[] = Array.isArray(
      additionalKwargs.extensions
    )
      ? additionalKwargs.extensions
      : []

    return {
      ...message,
      content: resolved.content,
      additional_kwargs: {
        ...additionalKwargs,
        extensions: [
          ...existingExtensions,
          ...resolved.instructions.map(toPromptExtension),
        ],
      },
    }
  })

  if (!hasInstruction) return body

  return JSON.stringify({
    ...requestBody,
    input: {
      ...requestBody.input,
      messages: transformedMessages,
    },
  })
}

/**
 * 注入 HumanMessage 扩展后将 LangGraph 请求交给浏览器 Fetch。
 *
 * @remarks
 * TODO: 文件系统返回附件路径后，在此把路径写入 HumanMessage 的
 * `additional_kwargs.extensions`，完成后删除该 TODO。
 * TODO: 后端确定推荐项的 Extension 协议后，在此统一把 `recommendation`
 * Token 写入 `additional_kwargs.extensions`；当前保持原样透传。
 */
export function fetchHandler(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if (typeof init?.body !== "string") return fetch(input, init)

  return fetch(input, {
    ...init,
    body: transformLangGraphRequestBody(init.body),
  })
}
