import {
  assertSafeRequestHeaders,
  expireRequestAuthentication,
  refreshRequestAuthentication,
  REQUEST_AUTH_MODE,
  resolveRequestAuthentication,
  type RequestAuthMode,
} from "@/api/authentication"
import { API_ORIGIN } from "@/api/client"
import { API_ERROR_CODE, ApiError } from "@/api/errors"

/** 原始 fetch 请求可附加的认证选项。 */
export interface FetchRequestOptions extends Omit<
  RequestInit,
  "credentials" | "headers"
> {
  /** 请求需要的认证模式；省略时为完全公开请求。 */
  readonly authMode?: RequestAuthMode
  /** 写操作是否必须附带内存中的 CSRF Token。 */
  readonly requiresCsrf?: boolean
  /** 非敏感业务请求头。 */
  readonly headers?: HeadersInit
}

/** 将目标限制到配置的唯一 API 来源。 */
function createApiRequestUrl(path: string | URL): URL {
  const url = new URL(path, `${API_ORIGIN}/`)
  if (
    url.origin !== API_ORIGIN ||
    url.username !== "" ||
    url.password !== "" ||
    url.hash !== ""
  ) {
    throw new ApiError({ code: API_ERROR_CODE.invalidRequest })
  }
  return url
}

/** 判断请求正文能否在认证刷新后安全重放。 */
function isReplayableBody(body: BodyInit | null | undefined): boolean {
  return !(
    typeof ReadableStream !== "undefined" && body instanceof ReadableStream
  )
}

/** 将业务请求头与认证层保护的请求头合并。 */
function createRequestHeaders(
  headers: HeadersInit | undefined,
  authenticationHeaders: Readonly<Record<string, string>>
): Headers {
  assertSafeRequestHeaders(headers)
  const result = new Headers(headers)
  for (const [name, value] of Object.entries(authenticationHeaders)) {
    result.set(name, value)
  }
  return result
}

/** 将原生 fetch 异常转换为项目稳定错误。 */
function normalizeFetchError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError({ code: API_ERROR_CODE.requestCancelled, cause: error })
  }
  return new ApiError({ code: API_ERROR_CODE.networkUnavailable, cause: error })
}

/** 判断当前模式能否在明确 401 后刷新 JWT。 */
function canRetryAuthentication(authMode: RequestAuthMode): boolean {
  return (
    authMode === REQUEST_AUTH_MODE.optional ||
    authMode === REQUEST_AUTH_MODE.required
  )
}

/**
 * 向项目 API 来源发送受控 fetch 请求并返回原始 Response。
 *
 * @remarks
 * 适用于 SSE、流式响应及需要读取原始响应头的场景。不可重放的流式正文收到
 * 401 时不会自动重试，调用方也不得用它请求第三方图片或外部资源。
 */
export async function fetchRequest(
  path: string | URL,
  options: FetchRequestOptions = {}
): Promise<Response> {
  const {
    authMode = REQUEST_AUTH_MODE.public,
    requiresCsrf = false,
    headers,
    body,
    ...requestInit
  } = options
  const url = createApiRequestUrl(path)

  try {
    let authentication = await resolveRequestAuthentication({
      authMode,
      requiresCsrf,
    })
    let response = await fetch(url, {
      ...requestInit,
      body,
      credentials: authentication.sendCredentials ? "include" : "omit",
      headers: createRequestHeaders(headers, authentication.headers),
    })

    if (
      response.status === 401 &&
      authentication.hasBearerToken &&
      canRetryAuthentication(authMode)
    ) {
      if (!isReplayableBody(body)) {
        expireRequestAuthentication()
        return response
      }

      const refreshed = await refreshRequestAuthentication()
      if (refreshed) {
        authentication = await resolveRequestAuthentication({
          authMode,
          requiresCsrf,
        })
        response = await fetch(url, {
          ...requestInit,
          body,
          credentials: "include",
          headers: createRequestHeaders(headers, authentication.headers),
        })
      }

      if (response.status === 401) {
        expireRequestAuthentication()
      }
    }

    return response
  } catch (error) {
    throw normalizeFetchError(error)
  }
}
