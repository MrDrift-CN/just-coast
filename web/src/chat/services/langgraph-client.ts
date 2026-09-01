import { Client } from "@langchain/langgraph-sdk"

import { API_ORIGIN } from "@/api"
import { fetchHandler } from "@/chat/services/fetch-handler"

/** Chat 使用的 LangGraph API 地址。 */
export const LANGGRAPH_API_URL = API_ORIGIN

/** 当前固定使用的 Python LangGraph Assistant 标识。 */
export const LANGGRAPH_ASSISTANT_ID = "agent"

/** Chat 请求在后端鉴权接入前共用的临时用户标识。 */
export const LANGGRAPH_REQUEST_HEADERS = { "X-User-Id": "1" } as const

/**
 * Chat 唯一 LangGraph SDK 客户端。
 *
 * @remarks
 * 当前后端尚未实现 Chat 鉴权，因此只发送固定 `X-User-Id: 1`。后续接入
 * Session/JWT 时，应在此处替换为 API 认证层提供的动态请求能力。
 */
export const LANGGRAPH_CLIENT = new Client({
  apiUrl: LANGGRAPH_API_URL,
  apiKey: null,
  defaultHeaders: LANGGRAPH_REQUEST_HEADERS,
  callerOptions: {
    fetch: fetchHandler,
    maxRetries: 0,
  },
})
