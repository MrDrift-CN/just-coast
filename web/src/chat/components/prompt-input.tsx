import {
  AuiIf,
  ComposerPrimitive,
  unstable_defaultDirectiveFormatter,
  unstable_useSlashCommandAdapter,
  useAui,
  useAuiEvent,
  type Unstable_TriggerItem,
} from "@assistant-ui/react"
import { LexicalComposerInput } from "@assistant-ui/react-lexical"
import {
  ArrowUpIcon,
  AtSignIcon,
  CommandIcon,
  PaperclipIcon,
  SparklesIcon,
  SquareIcon,
} from "lucide-react"
import type { ComponentType } from "react"
import { useTranslation } from "react-i18next"

import {
  CHAT_ATTACHMENT_ERROR_CODE,
  CHAT_ATTACHMENT_MAX_SIZE_MEGABYTES,
} from "@/chat/services/attachment-adapter"
import {
  createCommandTriggerAdapter,
  PROMPT_INSTRUCTION_TYPE,
  SLASH_COMMANDS,
} from "@/chat/services/command"
import { ComposerAttachments } from "@/components/assistant-ui/attachment"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

/** 聊天页面复用的消息输入组件参数。 */
interface PromptInputProps {
  /** 允许页面控制输入组件在主区域中的宽度和外边距。 */
  readonly className?: string
}

/** 附件添加失败事件中输入组件需要使用的字段。 */
interface PromptAttachmentError {
  /** assistant-ui 对附件失败原因的稳定分类。 */
  readonly reason: "adapter-error" | "no-adapter" | "not-accepted"

  /** 附件适配器提供的错误消息或错误代码。 */
  readonly message: string
}

/** 触发器结果列表的展示参数。 */
interface PromptTriggerItemsProps {
  /** 没有匹配结果时展示的说明。 */
  readonly emptyLabel: string

  /** 每个结果左侧使用的语义图标。 */
  readonly icon: ComponentType<{ className?: string }>

  /** 按触发项类型覆盖默认图标。 */
  readonly icons?: Readonly<
    Record<string, ComponentType<{ className?: string }>>
  >

  /** 按触发项类型声明列表中的视觉分组及其可选标题。 */
  readonly groups?: readonly PromptTriggerGroup[]
}

/** 触发器结果列表中的视觉分组。 */
interface PromptTriggerGroup {
  /** 需要归入此分组的触发项类型。 */
  readonly type: string

  /** 分组上方展示的标题；省略时只展示分组中的条目。 */
  readonly label?: string
}

/** 单个触发器结果的展示参数。 */
interface PromptTriggerItemProps {
  /** assistant-ui 提供的触发项。 */
  readonly item: Unstable_TriggerItem

  /** 触发项在 assistant-ui 原始结果中的位置。 */
  readonly index: number

  /** 触发项左侧展示的语义图标。 */
  readonly icon: ComponentType<{ className?: string }>
}

/** 触发器结果内容的展示参数。 */
interface PromptTriggerItemListProps extends PromptTriggerItemsProps {
  /** assistant-ui 根据当前输入过滤后的触发项。 */
  readonly items: readonly Unstable_TriggerItem[]
}

/** 输入框内指令 Token 的展示参数。 */
interface PromptDirectiveChipProps {
  /** 指令的稳定类型，用于区分提及、命令和推荐。 */
  readonly directiveType: string

  /** 输入框内展示的指令标题。 */
  readonly label: string
}

/** 将提及、命令和推荐渲染为输入光标流内的主题 Token。 */
const PromptDirectiveChip = ({
  directiveType,
  label,
}: PromptDirectiveChipProps) => (
  <span
    className="mx-0.5 inline-flex max-w-full items-center rounded-md bg-primary/10 px-1.5 py-0.5 align-baseline text-sm leading-5 font-medium text-primary"
    data-directive-type={directiveType}
  >
    <span className="truncate">{label}</span>
  </span>
)

/** 以单行布局展示触发项的图标、标题和说明。 */
const PromptTriggerItem = ({
  icon: Icon,
  index,
  item,
}: PromptTriggerItemProps) => (
  <ComposerPrimitive.Unstable_TriggerPopoverItem
    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-sm outline-none hover:bg-accent data-highlighted:bg-accent"
    index={index}
    item={item}
  >
    <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <span className="max-w-1/2 shrink-0 truncate font-medium">
        {item.label}
      </span>
      {item.description ? (
        <span
          className="min-w-0 flex-1 truncate text-end text-muted-foreground"
          title={item.description}
        >
          {item.description}
        </span>
      ) : null}
    </span>
  </ComposerPrimitive.Unstable_TriggerPopoverItem>
)

/** 展示平铺结果，或按调用方给定的顺序加入静态分组标题。 */
const PromptTriggerItemList = ({
  emptyLabel,
  groups,
  icon,
  icons,
  items,
}: PromptTriggerItemListProps) => {
  if (items.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">{emptyLabel}</p>
    )
  }

  const indexedItems = items.map((item, index) => ({ index, item }))

  if (!groups) {
    return indexedItems.map(({ index, item }) => (
      <PromptTriggerItem
        icon={icons?.[item.type] ?? icon}
        index={index}
        item={item}
        key={`${item.type}:${item.id}`}
      />
    ))
  }

  return groups
    .filter((group) => items.some((item) => item.type === group.type))
    .map((group) => (
      <div className="grid gap-0.5" key={group.type}>
        {group.label ? (
          <p className="px-3 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
        ) : null}
        {indexedItems
          .filter(({ item }) => item.type === group.type)
          .map(({ index, item }) => (
            <PromptTriggerItem
              icon={icons?.[item.type] ?? icon}
              index={index}
              item={item}
              key={`${item.type}:${item.id}`}
            />
          ))}
      </div>
    ))
}

/** 统一渲染 `@` 提及与 `/` 命令的候选项。 */
const PromptTriggerItems = ({
  emptyLabel,
  groups,
  icon: Icon,
  icons,
}: PromptTriggerItemsProps) => (
  <ComposerPrimitive.Unstable_TriggerPopoverItems className="grid gap-0.5">
    {(items) => (
      <PromptTriggerItemList
        emptyLabel={emptyLabel}
        groups={groups}
        icon={Icon}
        icons={icons}
        items={items}
      />
    )}
  </ComposerPrimitive.Unstable_TriggerPopoverItems>
)

/** 提供 assistant-ui 管理的消息输入及其全部输入扩展。 */
export const PromptInput = ({ className }: PromptInputProps) => {
  const { t } = useTranslation("chat")
  const aui = useAui()
  const slashCommands = unstable_useSlashCommandAdapter({
    commands: SLASH_COMMANDS,
  })
  const commandAdapter = createCommandTriggerAdapter()

  /** 将附件协议错误转换为用户可理解的通知。 */
  const handleAttachmentAddError = ({
    message,
    reason,
  }: PromptAttachmentError) => {
    let title = t("prompt.attachments.failed")

    if (reason === "not-accepted") {
      title = t("prompt.attachments.rejected")
    }

    if (message === CHAT_ATTACHMENT_ERROR_CODE.unsupportedMedia) {
      title = t("prompt.attachments.mediaUnsupported")
    }

    if (message === CHAT_ATTACHMENT_ERROR_CODE.tooLarge) {
      title = t("prompt.attachments.tooLarge", {
        maxSize: CHAT_ATTACHMENT_MAX_SIZE_MEGABYTES,
      })
    }

    toast.add({ title, type: "error" })
  }

  useAuiEvent("composer.attachmentAddError", handleAttachmentAddError)

  const mentionAdapter = {
    categories: () => [],
    categoryItems: () => [],
    search: (query: string) => {
      const normalizedQuery = query.toLocaleLowerCase()

      return Object.entries(aui.thread.getModelContext().tools ?? {})
        .map(([id, tool]) => ({
          id,
          type: "tool",
          label: id.replaceAll("_", " "),
          ...(tool.description ? { description: tool.description } : {}),
        }))
        .filter(
          (item) =>
            item.id.toLocaleLowerCase().includes(normalizedQuery) ||
            item.label.toLocaleLowerCase().includes(normalizedQuery) ||
            item.description?.toLocaleLowerCase().includes(normalizedQuery)
        )
    },
  }
  return (
    <ComposerPrimitive.Unstable_TriggerPopoverRoot>
      <ComposerPrimitive.AttachmentDropzone
        render={
          <ComposerPrimitive.Root
            className={cn(
              "relative flex w-full flex-col gap-2 rounded-2xl border border-border bg-background p-3 data-dragging:outline-2 data-dragging:outline-primary",
              className
            )}
          />
        }
      >
        <ComposerAttachments />

        <LexicalComposerInput
          aria-label={t("prompt.label")}
          className="relative max-h-48 min-h-10 w-full bg-transparent px-1 py-1 text-base leading-6 caret-primary outline-none [&_.aui-lexical-input]:min-h-8 [&_.aui-lexical-input]:outline-none [&_.aui-lexical-placeholder]:pointer-events-none [&_.aui-lexical-placeholder]:absolute [&_.aui-lexical-placeholder]:inset-x-1 [&_.aui-lexical-placeholder]:top-1 [&_.aui-lexical-placeholder]:text-muted-foreground"
          directiveChip={PromptDirectiveChip}
          placeholder={t("prompt.placeholder")}
          submitMode="enter"
        />

        <div className="flex items-center justify-between gap-2">
          <ComposerPrimitive.AddAttachment
            multiple={false}
            render={
              <Button
                aria-label={t("prompt.attachments.add")}
                size="icon"
                title={t("prompt.attachments.add")}
                type="button"
                variant="ghost"
              />
            }
          >
            <PaperclipIcon aria-hidden="true" />
          </ComposerPrimitive.AddAttachment>

          <div className="flex items-center gap-1">
            <AuiIf condition={(state) => !state.thread.isRunning}>
              <ComposerPrimitive.Send
                render={
                  <Button
                    aria-label={t("prompt.send")}
                    size="icon-lg"
                    title={t("prompt.send")}
                    type="button"
                  />
                }
              >
                <ArrowUpIcon aria-hidden="true" />
              </ComposerPrimitive.Send>
            </AuiIf>

            <AuiIf condition={(state) => state.thread.isRunning}>
              <ComposerPrimitive.Cancel
                render={
                  <Button
                    aria-label={t("prompt.stop")}
                    size="icon-lg"
                    title={t("prompt.stop")}
                    type="button"
                    variant="outline"
                  />
                }
              >
                <SquareIcon aria-hidden="true" className="fill-current" />
              </ComposerPrimitive.Cancel>
            </AuiIf>
          </div>
        </div>

        <ComposerPrimitive.Unstable_TriggerPopover
          adapter={mentionAdapter}
          aria-label={t("prompt.mentions.label")}
          char="@"
          className="absolute inset-x-0 bottom-full z-50 mb-2 grid max-h-64 gap-0.5 overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <ComposerPrimitive.Unstable_TriggerPopover.Directive
            formatter={unstable_defaultDirectiveFormatter}
          />
          <PromptTriggerItems
            emptyLabel={t("prompt.mentions.empty")}
            icon={AtSignIcon}
          />
        </ComposerPrimitive.Unstable_TriggerPopover>

        <ComposerPrimitive.Unstable_TriggerPopover
          adapter={commandAdapter}
          aria-label={t("prompt.commands.label")}
          char="/"
          className="absolute inset-x-0 bottom-full z-50 mb-2 grid max-h-64 gap-0.5 overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <ComposerPrimitive.Unstable_TriggerPopover.Action
            {...slashCommands.action}
          />
          <PromptTriggerItems
            emptyLabel={t("prompt.commands.empty")}
            groups={[
              { type: PROMPT_INSTRUCTION_TYPE.command },
              {
                label: t("prompt.commands.groups.skill"),
                type: PROMPT_INSTRUCTION_TYPE.skill,
              },
            ]}
            icon={CommandIcon}
            icons={{ skill: SparklesIcon }}
          />
        </ComposerPrimitive.Unstable_TriggerPopover>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Unstable_TriggerPopoverRoot>
  )
}
