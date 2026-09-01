import {
  ThreadListItemMorePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAui,
  useAuiState,
} from "@assistant-ui/react"
import {
  ArchiveIcon,
  EllipsisIcon,
  MessageSquareIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { useTranslation } from "react-i18next"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"

/** 线程列表接受的搜索条件。 */
interface ThreadListProps {
  /** 已由侧边栏搜索框维护的会话标题查询文本。 */
  readonly searchQuery: string
}

/** 显示尚未发送首条消息、因而还未持久化到 LangGraph 的本地对话。 */
const NewThreadDraftItem = () => {
  const { t } = useTranslation("chat")
  const aui = useAui()
  const newThreadId = useAuiState((state) => state.threads.newThreadId)
  const mainThreadId = useAuiState((state) => state.threads.mainThreadId)

  if (newThreadId === null) return null

  /** 重新选择仍保留在运行时中的本地草稿。 */
  const handleDraftSelect = () => {
    aui.threads.switchToNewThread()
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={newThreadId === mainThreadId}
        onClick={handleDraftSelect}
      >
        <MessageSquareIcon
          aria-hidden="true"
          className="text-sidebar-primary"
        />
        <span>{t("sidebar.untitledConversation")}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/** 提供单个历史对话的重命名、归档和删除操作。 */
const ThreadListItemActions = () => {
  const { t } = useTranslation("chat")
  const { t: tCommon } = useTranslation("common")
  const aui = useAui()
  const renameInputId = useId()
  const currentTitle = useAuiState((state) => state.threadListItem.title)
  const [renameTitle, setRenameTitle] = useState("")
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  /** 使用当前标题打开重命名对话框。 */
  const handleRenameSelect = () => {
    setRenameTitle(currentTitle ?? t("sidebar.untitledConversation"))
    setIsRenameDialogOpen(true)
  }

  /** 同步重命名对话框的受控打开状态。 */
  const handleRenameDialogOpenChange = (open: boolean) => {
    setIsRenameDialogOpen(open)
  }

  /** 将用户输入的新标题提交给当前线程运行时。 */
  const handleRenameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextTitle = renameTitle.trim()

    if (!nextTitle || isRenaming) return

    setIsRenaming(true)
    try {
      aui.threadListItem.rename(nextTitle)
      setIsRenameDialogOpen(false)
    } catch {
      toast.add({
        title: t("sidebar.renameFailed"),
        type: "error",
      })
    } finally {
      setIsRenaming(false)
    }
  }

  /** 打开当前对话的删除确认窗口。 */
  const handleDeleteSelect = () => {
    setIsDeleteDialogOpen(true)
  }

  /** 同步删除确认窗口的受控打开状态。 */
  const handleDeleteDialogOpenChange = (open: boolean) => {
    setIsDeleteDialogOpen(open)
  }

  /** 确认后通过当前线程运行时永久删除对话。 */
  const handleDeleteConfirm = () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      aui.threadListItem.delete()
      setIsDeleteDialogOpen(false)
    } catch {
      toast.add({
        title: t("sidebar.deleteFailed"),
        type: "error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <ThreadListItemMorePrimitive.Root sharedFocusGroup>
        <SidebarMenuAction
          aria-label={t("sidebar.threadActions")}
          render={<ThreadListItemMorePrimitive.Trigger />}
          showOnHover
          title={t("sidebar.threadActions")}
        >
          <EllipsisIcon aria-hidden="true" />
        </SidebarMenuAction>

        <ThreadListItemMorePrimitive.Content
          align="start"
          className="z-50 min-w-32 overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          side="right"
        >
          <ThreadListItemMorePrimitive.Item
            className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
            onSelect={handleRenameSelect}
          >
            <PencilIcon aria-hidden="true" />
            <span>{t("sidebar.renameConversation")}</span>
          </ThreadListItemMorePrimitive.Item>

          <ThreadListItemPrimitive.Archive
            render={
              <ThreadListItemMorePrimitive.Item className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" />
            }
          >
            <ArchiveIcon aria-hidden="true" />
            <span>{t("sidebar.archiveConversation")}</span>
          </ThreadListItemPrimitive.Archive>

          <ThreadListItemMorePrimitive.Separator className="-mx-1 my-1 h-px bg-border" />

          <ThreadListItemMorePrimitive.Item
            className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-destructive outline-hidden select-none focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
            onSelect={handleDeleteSelect}
          >
            <Trash2Icon aria-hidden="true" />
            <span>{t("sidebar.deleteConversation")}</span>
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemMorePrimitive.Content>
      </ThreadListItemMorePrimitive.Root>

      <Dialog
        onOpenChange={handleRenameDialogOpenChange}
        open={isRenameDialogOpen}
      >
        <DialogContent>
          <form className="grid gap-4" onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>{t("sidebar.renameConversation")}</DialogTitle>
              <DialogDescription>
                {t("sidebar.renameDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <Label htmlFor={renameInputId}>
                {t("sidebar.conversationTitle")}
              </Label>
              <Input
                autoFocus
                id={renameInputId}
                maxLength={100}
                onChange={(event) => setRenameTitle(event.currentTarget.value)}
                value={renameTitle}
              />
            </div>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                {tCommon("actions.cancel")}
              </DialogClose>
              <Button
                disabled={!renameTitle.trim() || isRenaming}
                type="submit"
              >
                {tCommon("actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={handleDeleteDialogOpenChange}
        open={isDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("sidebar.deleteConversation")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("sidebar.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tCommon("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              variant="destructive"
            >
              {t("sidebar.deleteConversation")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** 渲染当前 assistant-ui 线程作用域中的单个历史会话入口。 */
const ThreadListItem = () => {
  const { t } = useTranslation("chat")
  const isActive = useAuiState(
    (state) => state.threads.mainThreadId === state.threadListItem.id
  )

  return (
    <ThreadListItemPrimitive.Root asChild>
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          render={<ThreadListItemPrimitive.Trigger />}
        >
          <MessageSquareIcon
            aria-hidden="true"
            className="text-sidebar-primary"
          />
          <span className="truncate">
            <ThreadListItemPrimitive.Title
              fallback={t("sidebar.untitledConversation")}
            />
          </span>
        </SidebarMenuButton>

        <ThreadListItemActions />
      </SidebarMenuItem>
    </ThreadListItemPrimitive.Root>
  )
}

/** 当列表底部进入侧边栏滚动区域时自动读取下一页线程。 */
const ThreadListLoadMoreSentinel = () => {
  const aui = useAui()
  const sentinelRef = useRef<HTMLLIElement>(null)
  const isDisabled = useAuiState(
    (state) =>
      !state.threads.hasMore ||
      state.threads.isLoading ||
      state.threads.isLoadingMore
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || isDisabled) return

    const scrollContainer = sentinel.closest<HTMLElement>(
      '[data-sidebar="content"]'
    )
    if (!scrollContainer) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void aui.threads.loadMore()
        }
      },
      {
        root: scrollContainer,
        rootMargin: "0px 0px 96px",
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [aui, isDisabled])

  return isDisabled ? null : (
    <SidebarMenuItem ref={sentinelRef} aria-hidden="true" className="h-px" />
  )
}

/** 通过 assistant-ui 原语渲染、筛选并切换常规历史线程。 */
export const ThreadList = ({ searchQuery }: ThreadListProps) => {
  const { t } = useTranslation("chat")
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase()

  /** 判断后端线程标题是否满足当前侧边栏搜索条件。 */
  const matchesSearchQuery = (title: string | undefined) => {
    const visibleTitle = title ?? t("sidebar.untitledConversation")
    return visibleTitle.toLocaleLowerCase().includes(normalizedSearchQuery)
  }

  return (
    <ThreadListPrimitive.Root asChild>
      <SidebarMenu className="gap-0.5 p-2 group-data-[collapsible=icon]:hidden">
        {matchesSearchQuery(undefined) ? <NewThreadDraftItem /> : null}
        <ThreadListPrimitive.Items>
          {({ threadListItem }) =>
            matchesSearchQuery(threadListItem.title) ? <ThreadListItem /> : null
          }
        </ThreadListPrimitive.Items>
        <ThreadListLoadMoreSentinel />
      </SidebarMenu>
    </ThreadListPrimitive.Root>
  )
}
