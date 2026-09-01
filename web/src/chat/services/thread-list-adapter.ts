import type { RemoteThreadListAdapter } from "@assistant-ui/react"
import type { Thread } from "@langchain/langgraph-sdk"
import { createAssistantStream } from "assistant-stream"

import { LANGGRAPH_CLIENT } from "@/chat/services/langgraph-client"

/** 单页从 LangGraph API 读取的最大线程数。 */
const THREAD_LIST_PAGE_SIZE = 20

/** 自动标题最多保留的 Unicode 字符数。 */
const THREAD_TITLE_MAX_LENGTH = 50

/** 将 LangGraph 线程转换为 assistant-ui 官方线程元数据。 */
function toRemoteThreadMetadata(
  thread: Thread
): Awaited<ReturnType<RemoteThreadListAdapter["fetch"]>> {
  const metadata = thread.metadata ?? {}
  const title = metadata.title
  const custom = metadata.custom

  return {
    status: metadata.archived === true ? "archived" : "regular",
    remoteId: thread.thread_id,
    externalId: thread.thread_id,
    title:
      typeof title === "string" && title.trim() !== ""
        ? title.trim()
        : undefined,
    lastMessageAt: new Date(thread.state_updated_at),
    custom:
      typeof custom === "object" && custom !== null && !Array.isArray(custom)
        ? Object.fromEntries(Object.entries(custom))
        : undefined,
  }
}

/** 直接使用 Python LangGraph API 实现 assistant-ui 线程列表生命周期。 */
export const THREAD_LIST_ADAPTER: RemoteThreadListAdapter = {
  /** 按最后更新时间倒序读取常规与归档线程。 */
  list: async ({ after } = {}) => {
    const offset = Number(after ?? 0)
    const threads = await LANGGRAPH_CLIENT.threads.search({
      limit: THREAD_LIST_PAGE_SIZE + 1,
      offset,
      select: ["thread_id", "state_updated_at", "metadata"],
      sortBy: "state_updated_at",
      sortOrder: "desc",
    })
    const hasNextPage = threads.length > THREAD_LIST_PAGE_SIZE

    return {
      threads: threads
        .slice(0, THREAD_LIST_PAGE_SIZE)
        .map(toRemoteThreadMetadata),
      nextCursor: hasNextPage
        ? String(offset + THREAD_LIST_PAGE_SIZE)
        : undefined,
    }
  },

  /** 将用户修改的标题保存到 LangGraph 线程元数据。 */
  rename: async (remoteId, newTitle) => {
    await LANGGRAPH_CLIENT.threads.update(remoteId, {
      metadata: { title: newTitle },
      returnMinimal: true,
    })
  },

  /** 将业务自定义字段保存在独立的线程元数据命名空间中。 */
  updateCustom: async (remoteId, custom) => {
    await LANGGRAPH_CLIENT.threads.update(remoteId, {
      metadata: { custom: custom ?? null },
      returnMinimal: true,
    })
  },

  /** 使用元数据标记归档，不删除 LangGraph 检查点和消息。 */
  archive: async (remoteId) => {
    await LANGGRAPH_CLIENT.threads.update(remoteId, {
      metadata: { archived: true },
      returnMinimal: true,
    })
  },

  /** 清除归档标记并恢复线程。 */
  unarchive: async (remoteId) => {
    await LANGGRAPH_CLIENT.threads.update(remoteId, {
      metadata: { archived: false },
      returnMinimal: true,
    })
  },

  /** 永久删除 LangGraph 线程及其服务端状态。 */
  delete: (remoteId) => LANGGRAPH_CLIENT.threads.delete(remoteId),

  /** 使用 assistant-ui 生成的稳定标识创建 LangGraph 线程。 */
  initialize: async (threadId) => {
    const thread = await LANGGRAPH_CLIENT.threads.create({
      threadId,
      ifExists: "do_nothing",
      metadata: { archived: false },
    })

    return {
      remoteId: thread.thread_id,
      externalId: thread.thread_id,
    }
  },

  /** 使用首条用户消息的文本生成标题并同步到 LangGraph 元数据。 */
  generateTitle: async (remoteId, messages) => {
    const firstUserMessage = messages.find((message) => message.role === "user")
    const messageText =
      firstUserMessage?.content
        .map((part) => (part.type === "text" ? part.text : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim() ?? ""
    const title = Array.from(messageText)
      .slice(0, THREAD_TITLE_MAX_LENGTH)
      .join("")

    if (title === "") {
      return createAssistantStream(() => undefined)
    }

    await LANGGRAPH_CLIENT.threads.update(remoteId, {
      metadata: { title },
      returnMinimal: true,
    })

    return createAssistantStream((controller) => {
      controller.appendText(title)
    })
  },

  /** 按 LangGraph `thread_id` 读取单个线程。 */
  fetch: async (threadId) => {
    const thread = await LANGGRAPH_CLIENT.threads.get(threadId)
    return toRemoteThreadMetadata(thread)
  },
}
