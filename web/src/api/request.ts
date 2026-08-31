import type { AxiosResponse } from "axios"

import {
  assertSafeRequestHeaders,
  expireRequestAuthentication,
  refreshRequestAuthentication,
  REQUEST_AUTH_MODE,
  resolveRequestAuthentication,
  type RequestAuthMode,
  type ResolvedRequestAuthentication,
} from "@/api/authentication"
import { API_ORIGIN, apiClient, readApiRequestId } from "@/api/client"
import {
  API_ERROR_CODE,
  ApiError,
  getHttpErrorCode,
  isApiError,
} from "@/api/errors"
import {
  API_REQUEST_METHOD,
  API_SUCCESS_CODE,
  type ApiQuery,
  type ApiResponse,
  type ApiRequestOptions,
} from "@/api/types"

/** JSON 请求与响应使用的标准媒体类型。 */
const JSON_MEDIA_TYPE = "application/json"

/** 尚未通过业务解析器校验的统一响应信封。 */
interface UnknownApiResponse {
  /** 后端返回的业务码。 */
  readonly code: number
  /** 后端回显的 HTTP 状态。 */
  readonly status: number
  /** 后端提供的诊断消息。 */
  readonly message: string
  /** 等待具体服务解析的不可信业务数据。 */
  readonly data: unknown
}

/** 单次 Axios 请求需要的稳定参数。 */
interface JsonRequestAttempt {
  /** 已验证的后端相对路径。 */
  readonly path: string
  /** HTTP 方法。 */
  readonly method: (typeof API_REQUEST_METHOD)[keyof typeof API_REQUEST_METHOD]
  /** 可选 JSON 请求正文。 */
  readonly body?: string
  /** 调用方取消信号。 */
  readonly signal?: AbortSignal
  /** 超时毫秒数。 */
  readonly timeoutMs: number
  /** 非敏感业务请求头。 */
  readonly headers?: Readonly<Record<string, string>>
}

/** 判断未知值是否为可安全读取字段的普通对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** 判断响应媒体类型是否为 JSON 或 JSON 派生类型。 */
function isJsonMediaType(contentType: string): boolean {
  const mediaType = contentType.split(";", 1)[0]?.trim().toLowerCase() ?? ""
  return mediaType === JSON_MEDIA_TYPE || mediaType.endsWith("+json")
}

/** 校验查询参数中的数字，避免发送非有限值。 */
function serializeQueryValue(value: string | number | boolean): string {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new ApiError({ code: API_ERROR_CODE.invalidRequest })
  }
  return String(value)
}

/** 将相对接口路径与查询参数编码为受限后端路径。 */
function buildRequestPath(path: string, query?: ApiQuery): string {
  if (path.trim() === "") {
    throw new ApiError({ code: API_ERROR_CODE.invalidRequest })
  }

  const url = new URL(path, `${API_ORIGIN}/`)
  if (
    url.origin !== API_ORIGIN ||
    url.username !== "" ||
    url.password !== "" ||
    url.hash !== ""
  ) {
    throw new ApiError({ code: API_ERROR_CODE.invalidRequest })
  }

  if (query) {
    for (const [name, value] of Object.entries(query)) {
      if (value !== null && value !== undefined) {
        url.searchParams.set(name, serializeQueryValue(value))
      }
    }
  }
  return `${url.pathname}${url.search}`
}

/** 将调用方数据序列化为 JSON。 */
function serializeJson(value: unknown): string {
  try {
    const serialized = JSON.stringify(value)
    if (serialized === undefined) {
      throw new ApiError({ code: API_ERROR_CODE.invalidRequest })
    }
    return serialized
  } catch (error) {
    if (isApiError(error)) throw error
    throw new ApiError({ code: API_ERROR_CODE.invalidRequest, cause: error })
  }
}

/** 校验统一响应信封结构。 */
function parseApiResponse(
  value: unknown,
  requestId: string | undefined
): UnknownApiResponse {
  if (
    !isRecord(value) ||
    typeof value.code !== "number" ||
    !Number.isInteger(value.code) ||
    typeof value.status !== "number" ||
    !Number.isInteger(value.status) ||
    typeof value.message !== "string" ||
    !Object.prototype.hasOwnProperty.call(value, "data")
  ) {
    throw new ApiError({ code: API_ERROR_CODE.invalidResponse, requestId })
  }
  return {
    code: value.code,
    status: value.status,
    message: value.message,
    data: value.data,
  }
}

/** 从不可信失败正文中读取整数业务码。 */
function readBusinessCode(value: unknown): number | undefined {
  if (!isRecord(value)) return undefined
  return typeof value.code === "number" && Number.isInteger(value.code)
    ? value.code
    : undefined
}

/** 从 Axios 响应头读取规范化媒体类型。 */
function readContentType(response: AxiosResponse<unknown>): string {
  const value = response.headers["content-type"]
  return typeof value === "string" ? value : ""
}

/** 确认超时值能够安全交给 Axios。 */
function validateTimeout(timeoutMs: number): void {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new ApiError({ code: API_ERROR_CODE.invalidRequest })
  }
}

/** 判断当前模式能否在明确 401 后刷新并重试。 */
function canRetryAuthentication(authMode: RequestAuthMode): boolean {
  return (
    authMode === REQUEST_AUTH_MODE.optional ||
    authMode === REQUEST_AUTH_MODE.required
  )
}

/** 使用已解析认证信息发送一次 JSON 请求。 */
function sendJsonRequest(
  attempt: JsonRequestAttempt,
  authentication: ResolvedRequestAuthentication
): Promise<AxiosResponse<unknown>> {
  return apiClient.request<unknown>({
    url: attempt.path,
    method: attempt.method,
    headers: {
      ...(attempt.body === undefined
        ? {}
        : { "Content-Type": JSON_MEDIA_TYPE }),
      ...attempt.headers,
      ...authentication.headers,
    },
    signal: attempt.signal,
    timeout: attempt.timeoutMs,
    withCredentials: authentication.sendCredentials,
    ...(attempt.body === undefined ? {} : { data: attempt.body }),
  })
}

/** 将已建立连接的 Axios 响应校验并解析为项目响应信封。 */
function parseJsonResponse<TData>(
  response: AxiosResponse<unknown>,
  parseData: ApiRequestOptions<TData>["parseData"]
): ApiResponse<TData> {
  const requestId = readApiRequestId(response.headers)
  if (response.status < 200 || response.status >= 300) {
    throw new ApiError({
      code: getHttpErrorCode(response.status),
      status: response.status,
      businessCode: readBusinessCode(response.data),
      requestId,
    })
  }
  if (
    response.status === 204 ||
    response.status === 205 ||
    !isJsonMediaType(readContentType(response))
  ) {
    throw new ApiError({
      code: API_ERROR_CODE.invalidResponse,
      status: response.status,
      requestId,
    })
  }

  const envelope = parseApiResponse(response.data, requestId)
  if (envelope.status !== response.status) {
    throw new ApiError({
      code: API_ERROR_CODE.invalidResponse,
      status: response.status,
      businessCode: envelope.code,
      requestId,
    })
  }
  if (envelope.code !== API_SUCCESS_CODE) {
    throw new ApiError({
      code: API_ERROR_CODE.businessRejected,
      status: response.status,
      businessCode: envelope.code,
      requestId,
    })
  }

  try {
    return {
      code: envelope.code,
      status: envelope.status,
      message: envelope.message,
      data: parseData(envelope.data),
    }
  } catch (error) {
    if (isApiError(error)) throw error
    throw new ApiError({
      code: API_ERROR_CODE.invalidResponse,
      status: response.status,
      businessCode: envelope.code,
      requestId,
      cause: error,
    })
  }
}

/**
 * 向项目后端发送统一 JSON 请求并返回经过运行时校验的响应信封。
 *
 * @remarks
 * 认证模式统一决定 Cookie、JWT、用户标识和 CSRF Token。携带 Bearer JWT 的
 * 请求收到 401 时只强制刷新并重试一次，再次失败立即清理认证状态。
 */
export async function request<TData>(
  path: string,
  options: ApiRequestOptions<TData>
): Promise<ApiResponse<TData>> {
  const {
    query,
    json,
    signal,
    timeoutMs,
    parseData,
    headers,
    method = API_REQUEST_METHOD.get,
    authMode = REQUEST_AUTH_MODE.public,
    requiresCsrf = false,
  } = options
  const hasJsonBody = json !== undefined
  if (hasJsonBody && method === API_REQUEST_METHOD.get) {
    throw new ApiError({ code: API_ERROR_CODE.invalidRequest })
  }

  validateTimeout(timeoutMs)
  assertSafeRequestHeaders(headers)
  const attempt: JsonRequestAttempt = {
    path: buildRequestPath(path, query),
    method,
    timeoutMs,
    ...(signal ? { signal } : {}),
    ...(headers ? { headers } : {}),
    ...(hasJsonBody ? { body: serializeJson(json) } : {}),
  }
  let authentication = await resolveRequestAuthentication({
    authMode,
    requiresCsrf,
  })
  let response = await sendJsonRequest(attempt, authentication)

  if (
    response.status === 401 &&
    authentication.hasBearerToken &&
    canRetryAuthentication(authMode)
  ) {
    try {
      const refreshed = await refreshRequestAuthentication()
      if (refreshed) {
        authentication = await resolveRequestAuthentication({
          authMode,
          requiresCsrf,
        })
        response = await sendJsonRequest(attempt, authentication)
      }
    } catch {
      expireRequestAuthentication()
    }

    if (response.status === 401) {
      expireRequestAuthentication()
    }
  }

  return parseJsonResponse(response, parseData)
}

export { API_ORIGIN }
