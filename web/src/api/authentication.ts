import { API_ERROR_CODE, ApiError } from "@/api/errors"

/** 请求能够声明的认证模式。 */
export const REQUEST_AUTH_MODE = {
  /** 完全公开的请求，不携带 Cookie、JWT、用户标识或 CSRF Token。 */
  public: "public",
  /** 仅依赖 HttpOnly Cookie Session 的认证请求。 */
  session: "session",
  /** 允许匿名访问，存在有效真实身份时附带完整认证信息。 */
  optional: "optional",
  /** 必须同时具备 Cookie Session、真实 JWT 与用户标识的请求。 */
  required: "required",
} as const

/** 请求认证模式值。 */
export type RequestAuthMode =
  (typeof REQUEST_AUTH_MODE)[keyof typeof REQUEST_AUTH_MODE]

/** 受认证层保护、业务调用方不得自行设置的请求头名称。 */
const PROTECTED_AUTHENTICATION_HEADERS = [
  "authorization",
  "x-user-id",
  "x-csrf-token",
] as const

/** JWT 在发送前至少应剩余的有效毫秒数。 */
const ACCESS_TOKEN_MINIMUM_VALIDITY_MS = 30_000

/** API 层能够读取的短期访问令牌结构。 */
export interface RequestAccessToken {
  /** Bearer JWT 原始值。 */
  readonly value: string
  /** ISO 8601 格式的令牌过期时间。 */
  readonly expiresAt: string
  /** 是否为禁止发送到真实服务的本地 Mock 令牌。 */
  readonly mockOnly: boolean
}

/** Auth 层向 API 层提供的最小认证身份。 */
export interface RequestAuthenticationIdentity {
  /** 当前登录用户的稳定标识。 */
  readonly userId: string | null
  /** 当前内存中的短期 JWT。 */
  readonly accessToken: RequestAccessToken | null
  /** 当前内存中的 CSRF Token。 */
  readonly csrfToken: string | null
}

/** Auth 层通过依赖倒置注册给 API 层的认证能力。 */
export interface RequestAuthenticationProvider {
  /** 同步读取当前内存认证身份。 */
  readonly readIdentity: () => RequestAuthenticationIdentity
  /** 单飞刷新短期 JWT 并返回最新身份。 */
  readonly refreshAccessToken: () => Promise<RequestAuthenticationIdentity>
  /** 将当前身份标记为过期并清除敏感状态。 */
  readonly expireSession: () => void
}

/** 单次请求解析出的认证请求配置。 */
export interface ResolvedRequestAuthentication {
  /** 只由认证层生成的受保护请求头。 */
  readonly headers: Readonly<Record<string, string>>
  /** 是否允许浏览器随请求发送 HttpOnly Cookie。 */
  readonly sendCredentials: boolean
  /** 当前请求是否实际携带了真实 Bearer JWT。 */
  readonly hasBearerToken: boolean
}

/** 解析请求认证信息所需的选项。 */
export interface ResolveRequestAuthenticationOptions {
  /** 当前请求使用的认证模式。 */
  readonly authMode?: RequestAuthMode
  /** 当前写操作是否必须附带 CSRF Token。 */
  readonly requiresCsrf?: boolean
}

/** 当前由 Auth 层注册的认证提供者。 */
let authenticationProvider: RequestAuthenticationProvider | null = null

/** 判断短期 JWT 是否真实且具有足够剩余有效期。 */
function isAccessTokenUsable(
  token: RequestAccessToken | null
): token is RequestAccessToken {
  return Boolean(
    token &&
    !token.mockOnly &&
    token.value.trim() !== "" &&
    Date.parse(token.expiresAt) - Date.now() > ACCESS_TOKEN_MINIMUM_VALIDITY_MS
  )
}

/** 创建缺少可用认证状态时的稳定错误。 */
function createAuthenticationRequiredError(): ApiError {
  return new ApiError({ code: API_ERROR_CODE.authenticationRequired })
}

/** 读取已注册提供者；受保护请求缺少提供者时立即失败。 */
function readAuthenticationProvider(): RequestAuthenticationProvider {
  if (!authenticationProvider) {
    throw createAuthenticationRequiredError()
  }

  return authenticationProvider
}

/** 拒绝业务调用方覆盖 Authorization、用户标识或 CSRF 请求头。 */
export function assertSafeRequestHeaders(headers?: HeadersInit): void {
  if (!headers) return

  let normalizedHeaders: Headers
  try {
    normalizedHeaders = new Headers(headers)
  } catch (error) {
    throw new ApiError({ code: API_ERROR_CODE.invalidRequest, cause: error })
  }
  for (const name of PROTECTED_AUTHENTICATION_HEADERS) {
    if (normalizedHeaders.has(name)) {
      throw new ApiError({ code: API_ERROR_CODE.invalidRequest })
    }
  }
}

/** 注册 Auth 运行时，返回只会移除当前提供者的清理函数。 */
export function registerRequestAuthenticationProvider(
  provider: RequestAuthenticationProvider
): () => void {
  authenticationProvider = provider

  return () => {
    if (authenticationProvider === provider) {
      authenticationProvider = null
    }
  }
}

/** 根据模式解析 Cookie、JWT、用户标识与 CSRF 请求头。 */
export async function resolveRequestAuthentication({
  authMode = REQUEST_AUTH_MODE.public,
  requiresCsrf = false,
}: ResolveRequestAuthenticationOptions = {}): Promise<ResolvedRequestAuthentication> {
  if (authMode === REQUEST_AUTH_MODE.public) {
    return { headers: {}, sendCredentials: false, hasBearerToken: false }
  }

  const provider = readAuthenticationProvider()
  let identity = provider.readIdentity()

  if (
    (authMode === REQUEST_AUTH_MODE.required ||
      authMode === REQUEST_AUTH_MODE.optional) &&
    identity.userId !== null &&
    (!identity.accessToken ||
      (!identity.accessToken.mockOnly &&
        !isAccessTokenUsable(identity.accessToken)))
  ) {
    try {
      identity = await provider.refreshAccessToken()
    } catch (error) {
      if (authMode === REQUEST_AUTH_MODE.required) throw error
      provider.expireSession()
      identity = provider.readIdentity()
    }
  }

  const userId = identity.userId
  const accessToken = identity.accessToken
  const authenticated = userId !== null && isAccessTokenUsable(accessToken)

  if (authMode === REQUEST_AUTH_MODE.required && !authenticated) {
    throw createAuthenticationRequiredError()
  }

  const headers: Record<string, string> = {}
  if (userId !== null && isAccessTokenUsable(accessToken)) {
    headers.Authorization = `Bearer ${accessToken.value}`
    headers["X-User-Id"] = userId
  }

  if (requiresCsrf) {
    if (!identity.csrfToken) throw createAuthenticationRequiredError()
    headers["X-CSRF-Token"] = identity.csrfToken
  }

  return {
    headers,
    sendCredentials: true,
    hasBearerToken: authenticated,
  }
}

/** 强制刷新短期 JWT，供明确的 401 最多重试一次。 */
export async function refreshRequestAuthentication(): Promise<boolean> {
  const provider = readAuthenticationProvider()
  const identity = await provider.refreshAccessToken()
  return identity.userId !== null && isAccessTokenUsable(identity.accessToken)
}

/** 在认证重试失败或再次收到 401 时清除敏感身份。 */
export function expireRequestAuthentication(): void {
  authenticationProvider?.expireSession()
}
