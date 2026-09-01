import {
  AssistantRuntimeProvider,
  AuiConfig,
  Suggestions,
  useAui,
} from "@assistant-ui/react"
import { useStreamRuntime } from "@assistant-ui/react-langchain"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Outlet, useMatch, useNavigate } from "react-router"

import { LeftSidebar } from "@/chat/layouts/left-sidebar"
import { CHAT_ATTACHMENT_ADAPTER } from "@/chat/services/attachment-adapter"
import { fetchHandler } from "@/chat/services/fetch-handler"
import {
  LANGGRAPH_API_URL,
  LANGGRAPH_ASSISTANT_ID,
  LANGGRAPH_REQUEST_HEADERS,
} from "@/chat/services/langgraph-client"
import { createWelcomeSuggestions } from "@/chat/services/suggestion"
import { THREAD_LIST_ADAPTER } from "@/chat/services/thread-list-adapter"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

/** LangChain Stream Runtime 共用的输入扩展适配器。 */
const LANGCHAIN_RUNTIME_ADAPTERS = {
  attachments: CHAT_ATTACHMENT_ADAPTER,
} as const

/** Chat 规范路由与 assistant-ui 当前远程线程之间的同步参数。 */
interface ThreadRouteSyncProps {
  /** 路由当前指定的 LangGraph 线程标识；其他 Chat 页面不指定线程。 */
  readonly threadId: string | undefined
}

/** 将浏览器路由变化同步到 assistant-ui 当前远程线程。 */
const ThreadRouteSync = ({ threadId }: ThreadRouteSyncProps) => {
  const aui = useAui()

  useEffect(() => {
    if (threadId === undefined) {
      aui.threads.switchToNewThread()
      return
    }

    aui.threads.switchToThread(threadId)
  }, [aui, threadId])

  return null
}

/** 组合 Chat 运行时、规范路由、左侧导航与子页面内容。 */
export const Main = () => {
  const { t } = useTranslation("chat")
  const navigate = useNavigate()
  const threadRouteMatch = useMatch("/chat/thread_id/:thread_id")
  const threadId = threadRouteMatch?.params.thread_id

  /** 将运行时选中的远程线程同步到 Chat 拥有的规范路由。 */
  const handleThreadIdChange = (nextThreadId: string | undefined) => {
    if (nextThreadId === threadId) return

    if (!nextThreadId) {
      void navigate("/chat/welcome")
      return
    }

    void navigate(`/chat/thread_id/${encodeURIComponent(nextThreadId)}`)
  }

  const runtime = useStreamRuntime({
    apiUrl: LANGGRAPH_API_URL,
    assistantId: LANGGRAPH_ASSISTANT_ID,
    defaultHeaders: LANGGRAPH_REQUEST_HEADERS,
    fetch: fetchHandler,
    onThreadIdChange: handleThreadIdChange,
    unstable_threadListAdapter: THREAD_LIST_ADAPTER,
    adapters: LANGCHAIN_RUNTIME_ADAPTERS,
  })
  const config = AuiConfig({
    suggestions: Suggestions(createWelcomeSuggestions(t)),
  })

  return (
    <AssistantRuntimeProvider config={config} runtime={runtime}>
      <ThreadRouteSync threadId={threadId} />
      <SidebarProvider>
        <LeftSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  )
}
