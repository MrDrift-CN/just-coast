import {
  AUTHENTICATION_METHOD,
  QR_LOGIN_STATUS,
  type AuthenticationMethod,
  type AuthenticationResult,
  type AuthSession,
  type AuthSessionSnapshot,
  type AuthUser,
  type GithubAuthorization,
  type JwtAccessToken,
  type PasswordResetAuthorization,
  type PasswordResetResult,
  type QrLoginChallenge,
  type QrLoginDecisionResult,
  type QrLoginStatus,
  type QrLoginStatusResult,
  type RegistrationResult,
  type VerificationCodeResult,
} from "@/auth/types"

/** 将未知值收窄为可安全读取字段的普通对象。 */
function parseRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Expected an object")
  }

  return value as Record<string, unknown>
}

/** 从对象中读取必需字符串。 */
function parseString(record: Record<string, unknown>, key: string): string {
  const value = record[key]

  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`Expected ${key} to be a non-empty string`)
  }

  return value
}

/** 从对象中读取可选字符串。 */
function parseOptionalString(
  record: Record<string, unknown>,
  key: string
): string | undefined {
  const value = record[key]

  if (value === undefined) return undefined
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`Expected ${key} to be a non-empty string`)
  }

  return value
}

/** 解析不携带凭据、片段且仅使用 HTTP(S) 的绝对地址。 */
function parseHttpUrl(value: string): URL {
  const url = new URL(value)

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username !== "" ||
    url.password !== "" ||
    url.hash !== ""
  ) {
    throw new TypeError("Expected a safe HTTP URL")
  }

  return url
}

/** 校验服务端返回的认证方式。 */
function parseAuthenticationMethod(value: unknown): AuthenticationMethod {
  if (
    typeof value === "string" &&
    Object.values(AUTHENTICATION_METHOD).some((method) => method === value)
  ) {
    return value as AuthenticationMethod
  }

  throw new TypeError("Expected a supported authentication method")
}

/** 校验服务端返回的扫码登录状态。 */
function parseQrLoginStatus(value: unknown): QrLoginStatus {
  if (
    typeof value === "string" &&
    Object.values(QR_LOGIN_STATUS).some((status) => status === value)
  ) {
    return value as QrLoginStatus
  }

  throw new TypeError("Expected a supported QR login status")
}

/** 解析认证用户的安全公开字段。 */
function parseAuthUser(value: unknown): AuthUser {
  const record = parseRecord(value)
  const avatarUrl = parseOptionalString(record, "avatarUrl")

  return {
    id: parseString(record, "id"),
    username: parseString(record, "username"),
    email: parseString(record, "email"),
    ...(avatarUrl ? { avatarUrl } : {}),
  }
}

/** 解析服务端 Session 摘要。 */
function parseAuthSession(value: unknown): AuthSession {
  const record = parseRecord(value)

  return {
    user: parseAuthUser(record.user),
    authenticationMethod: parseAuthenticationMethod(
      record.authenticationMethod
    ),
    expiresAt: parseString(record, "expiresAt"),
  }
}

/** 解析短期 JWT 及其有效期。 */
function parseJwtAccessToken(value: unknown): JwtAccessToken {
  const record = parseRecord(value)
  const tokenType = parseString(record, "tokenType")

  if (tokenType !== "Bearer") {
    throw new TypeError("Expected a Bearer access token")
  }

  return {
    value: parseString(record, "value"),
    tokenType,
    expiresAt: parseString(record, "expiresAt"),
    mockOnly: false,
  }
}

/** 解析登录成功结果。 */
export function parseAuthenticationResult(
  value: unknown
): AuthenticationResult {
  const record = parseRecord(value)

  if (record.authenticated !== true) {
    throw new TypeError("Expected an authenticated result")
  }

  return {
    authenticated: true,
    session: parseAuthSession(record.session),
    accessToken: parseJwtAccessToken(record.accessToken),
    csrfToken: parseString(record, "csrfToken"),
  }
}

/** 解析可为空的当前 Session、JWT 与 CSRF Token 快照。 */
export function parseAuthSessionSnapshot(value: unknown): AuthSessionSnapshot {
  const record = parseRecord(value)
  const session =
    record.session === null ? null : parseAuthSession(record.session)
  const accessToken =
    record.accessToken === null ? null : parseJwtAccessToken(record.accessToken)
  const csrfToken =
    record.csrfToken === null ? null : parseString(record, "csrfToken")

  if (
    (session === null && accessToken !== null) ||
    (session !== null && (accessToken === null || csrfToken === null))
  ) {
    throw new TypeError("Expected a consistent authentication snapshot")
  }

  return {
    session,
    accessToken,
    csrfToken,
  }
}

/** 解析新账户创建结果。 */
export function parseRegistrationResult(value: unknown): RegistrationResult {
  const record = parseRecord(value)

  if (record.registered !== true) {
    throw new TypeError("Expected a registered result")
  }

  return { registered: true, userId: parseString(record, "userId") }
}

/** 解析验证码发送结果。 */
export function parseVerificationCodeResult(
  value: unknown
): VerificationCodeResult {
  const record = parseRecord(value)

  if (record.sent !== true) {
    throw new TypeError("Expected a sent verification code result")
  }

  const previewCode = parseOptionalString(record, "previewCode")
  return {
    sent: true,
    expiresAt: parseString(record, "expiresAt"),
    ...(previewCode ? { previewCode } : {}),
  }
}

/** 解析密码重置短期授权。 */
export function parsePasswordResetAuthorization(
  value: unknown
): PasswordResetAuthorization {
  const record = parseRecord(value)

  return {
    authorizationId: parseString(record, "authorizationId"),
    expiresAt: parseString(record, "expiresAt"),
  }
}

/** 解析密码重置完成结果。 */
export function parsePasswordResetResult(value: unknown): PasswordResetResult {
  const record = parseRecord(value)

  if (record.reset !== true) {
    throw new TypeError("Expected a password reset result")
  }

  return { reset: true }
}

/** 解析 GitHub OAuth 授权地址。 */
export function parseGithubAuthorization(value: unknown): GithubAuthorization {
  const record = parseRecord(value)
  const authorizationUrl = parseHttpUrl(parseString(record, "authorizationUrl"))

  if (
    authorizationUrl.protocol !== "https:" ||
    authorizationUrl.hostname !== "github.com" ||
    authorizationUrl.pathname !== "/login/oauth/authorize"
  ) {
    throw new TypeError("Expected the GitHub OAuth authorization URL")
  }

  return { authorizationUrl: authorizationUrl.toString() }
}

/** 解析桌面端扫码登录挑战。 */
export function parseQrLoginChallenge(value: unknown): QrLoginChallenge {
  const record = parseRecord(value)
  const confirmationUrl = parseHttpUrl(parseString(record, "confirmationUrl"))

  if (
    typeof window !== "undefined" &&
    confirmationUrl.origin !== window.location.origin
  ) {
    throw new TypeError("Expected a project-owned QR confirmation URL")
  }

  return {
    challengeId: parseString(record, "challengeId"),
    confirmationUrl: confirmationUrl.toString(),
    status: parseQrLoginStatus(record.status),
    expiresAt: parseString(record, "expiresAt"),
    mockOnly: false,
  }
}

/** 解析移动端扫码决策结果。 */
export function parseQrLoginDecisionResult(
  value: unknown
): QrLoginDecisionResult {
  return { status: parseQrLoginStatus(parseRecord(value).status) }
}

/** 解析桌面端轮询得到的扫码状态和可选认证结果。 */
export function parseQrLoginStatusResult(value: unknown): QrLoginStatusResult {
  const record = parseRecord(value)
  const authentication = record.authentication

  return {
    status: parseQrLoginStatus(record.status),
    ...(authentication === undefined
      ? {}
      : { authentication: parseAuthenticationResult(authentication) }),
  }
}
