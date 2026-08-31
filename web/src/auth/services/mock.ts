import {
  API_ERROR_CODE,
  API_SUCCESS_CODE,
  ApiError,
  type ApiResponse,
} from "@/api"
import type { AuthGateway } from "@/auth/services/contract"
import {
  AUTHENTICATION_METHOD,
  QR_LOGIN_STATUS,
  type AuthenticationMethod,
  type AuthenticationResult,
  type AuthSession,
  type AuthSessionSnapshot,
  type AuthUser,
  type GithubCallbackInput,
  type JwtAccessToken,
  type LoginCredentials,
  type PasswordResetInput,
  type PasswordResetVerificationInput,
  type QrLoginChallenge,
  type QrLoginChallengeInput,
  type QrLoginDecisionInput,
  type QrLoginStatus,
  type QrLoginStatusResult,
  type RegistrationInput,
  type VerificationCodePurpose,
  type VerificationCodeRequest,
} from "@/auth/types"

/** Mock 接口模拟的成功 HTTP 状态。 */
const MOCK_SUCCESS_STATUS = 200

/** Mock 请求的最小延迟，避免界面只在同步路径下表现正常。 */
const MOCK_REQUEST_DELAY_MS = 220

/** Mock 邮箱验证码的有效时长。 */
const MOCK_VERIFICATION_CODE_TTL_MS = 5 * 60 * 1000

/** Mock Session 的有效时长。 */
const MOCK_SESSION_TTL_MS = 8 * 60 * 60 * 1000

/** Mock JWT 的有效时长。 */
const MOCK_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000

/** Mock 密码重置授权的有效时长。 */
const MOCK_PASSWORD_RESET_TTL_MS = 10 * 60 * 1000

/** Mock 扫码登录挑战的有效时长。 */
const MOCK_QR_LOGIN_TTL_MS = 2 * 60 * 1000

/** 本地完整演练认证流程时使用的固定验证码。 */
const MOCK_VERIFICATION_CODE = "123456"

/** 本地预览验证码错误时使用的固定失败码。 */
const MOCK_FAILURE_VERIFICATION_CODE = "000000"

/** 本地预览网络错误时使用的固定失败邮箱。 */
const MOCK_FAILURE_EMAIL = "failure@example.com"

/** Mock GitHub 回调使用的一次性授权码。 */
const MOCK_GITHUB_CODE = "mock-github-code"

/** Mock GitHub 回调使用的防伪状态值。 */
const MOCK_GITHUB_STATE = "mock-github-state"

/** 跨标签页同步 Mock 扫码状态使用的通道名称。 */
const MOCK_QR_CHANNEL_NAME = "just-coast-auth-qr-mock"

/** Mock 账号在当前页面生命周期内保存的字段。 */
interface MockAccount {
  /** 可公开给其他业务层的用户资料。 */
  readonly user: AuthUser
  /** 仅保存在当前内存中的模拟密码。 */
  password: string
}

/** 已发送 Mock 验证码的内存记录。 */
interface MockVerificationRecord {
  /** 固定的本地验证码。 */
  readonly code: string
  /** 验证码失效时间戳。 */
  readonly expiresAt: number
}

/** 密码重置授权的内存记录。 */
interface MockPasswordResetAuthorization {
  /** 授权对应的邮箱地址。 */
  readonly email: string
  /** 授权失效时间戳。 */
  readonly expiresAt: number
}

/** 桌面端 Mock 扫码挑战的内存记录。 */
interface MockQrLoginRecord {
  /** 返回给界面的公开挑战数据。 */
  readonly challenge: QrLoginChallenge
  /** 移动端确认后建立的认证结果。 */
  readonly authentication?: AuthenticationResult
}

/** 标签页之间传递的 Mock 扫码状态消息。 */
interface MockQrMessage {
  /** 被更新的扫码挑战标识。 */
  readonly challengeId: string
  /** 移动端产生的新挑战状态。 */
  readonly status: QrLoginStatus
}

/** 判断跨标签页输入是否为项目支持的扫码登录状态。 */
function isQrLoginStatus(value: unknown): value is QrLoginStatus {
  return Object.values(QR_LOGIN_STATUS).some((candidate) => candidate === value)
}

/** 当前页面生命周期内创建的 Mock 账号。 */
const accounts = new Map<string, MockAccount>()

/** 无需先注册即可用于演练登录流程的本地示例账号。 */
const MOCK_DEMO_ACCOUNT: MockAccount = {
  user: {
    id: "mock-demo-user",
    username: "demo",
    email: "demo@example.invalid",
  },
  password: "MockPassword123!",
}

accounts.set(MOCK_DEMO_ACCOUNT.user.email, MOCK_DEMO_ACCOUNT)

/** 当前页面生命周期内发送的 Mock 验证码。 */
const verificationCodes = new Map<string, MockVerificationRecord>()

/** 当前页面生命周期内签发的 Mock 密码重置授权。 */
const passwordResetAuthorizations = new Map<
  string,
  MockPasswordResetAuthorization
>()

/** 当前页面生命周期内创建的 Mock 扫码挑战。 */
const qrLoginRecords = new Map<string, MockQrLoginRecord>()

/** 当前内存中的 Mock Session 摘要。 */
let activeSession: AuthSession | null = null

/** 当前内存中的 Mock 短期 JWT。 */
let activeAccessToken: JwtAccessToken | null = null

/** 当前内存中的 Mock CSRF Token。 */
let activeCsrfToken: string | null = null

/** 浏览器支持时用于模拟跨标签页扫码确认。 */
const qrChannel =
  typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel(MOCK_QR_CHANNEL_NAME)

/** 创建带指定毫秒偏移的 ISO 8601 时间。 */
function createExpiry(durationMs: number): string {
  return new Date(Date.now() + durationMs).toISOString()
}

/** 创建不包含业务含义的 Mock 标识。 */
function createMockId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

/** 等待短暂延迟后返回符合项目协议的 Mock 成功响应。 */
async function createMockResponse<TData>(
  data: TData
): Promise<ApiResponse<TData>> {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, MOCK_REQUEST_DELAY_MS)
  })

  return {
    code: API_SUCCESS_CODE,
    status: MOCK_SUCCESS_STATUS,
    message: "mockSuccess",
    data,
  }
}

/** 将邮箱地址标准化为内存数据索引。 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** 组合邮箱与验证码用途，防止验证码跨场景复用。 */
function createVerificationKey(
  email: string,
  purpose: VerificationCodePurpose
): string {
  return `${purpose}:${normalizeEmail(email)}`
}

/** 为本地预览创建与真实请求层一致的结构化错误。 */
function createMockError(
  code: (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE]
): ApiError {
  return new ApiError({ code })
}

/** 校验验证码存在、未过期且属于当前邮箱和用途。 */
function verifyCode(
  email: string,
  purpose: VerificationCodePurpose,
  code: string
): void {
  if (code === MOCK_FAILURE_VERIFICATION_CODE) {
    throw createMockError(API_ERROR_CODE.businessRejected)
  }

  const key = createVerificationKey(email, purpose)
  const record = verificationCodes.get(key)

  if (!record || record.expiresAt <= Date.now() || record.code !== code) {
    throw createMockError(API_ERROR_CODE.businessRejected)
  }

  verificationCodes.delete(key)
}

/** 将安全用户资料、Session、短期 Mock JWT 和 CSRF Token 组合为登录结果。 */
function createAuthentication(
  user: AuthUser,
  authenticationMethod: AuthenticationMethod
): AuthenticationResult {
  const session: AuthSession = {
    user,
    authenticationMethod,
    expiresAt: createExpiry(MOCK_SESSION_TTL_MS),
  }
  const accessToken: JwtAccessToken = {
    value: `mock.${createMockId("jwt")}.unsigned`,
    tokenType: "Bearer",
    expiresAt: createExpiry(MOCK_ACCESS_TOKEN_TTL_MS),
    mockOnly: true,
  }
  const csrfToken = createMockId("csrf")

  activeSession = session
  activeAccessToken = accessToken
  activeCsrfToken = csrfToken
  return { authenticated: true, session, accessToken, csrfToken }
}

/** 校验当前内存账号的用户名、邮箱和密码。 */
function findCredentialUser(credentials: LoginCredentials): AuthUser {
  const email = normalizeEmail(credentials.email)
  const existingAccount = accounts.get(email)

  if (
    !existingAccount ||
    existingAccount.user.username !== credentials.username.trim() ||
    existingAccount.password !== credentials.password
  ) {
    throw createMockError(API_ERROR_CODE.businessRejected)
  }

  return existingAccount.user
}

/** 判断 ISO 8601 时间是否已经过期。 */
function hasExpired(expiresAt: string): boolean {
  return Date.parse(expiresAt) <= Date.now()
}

/** 创建当前 Session、JWT 与 CSRF Token 的内存快照。 */
function createSessionSnapshot(): AuthSessionSnapshot {
  if (!activeSession || hasExpired(activeSession.expiresAt)) {
    activeSession = null
    activeAccessToken = null
    activeCsrfToken = null
  }

  return {
    session: activeSession,
    accessToken: activeAccessToken,
    csrfToken: activeCsrfToken,
  }
}

/** 使用现有 Session 重新签发 Mock 短期 JWT。 */
function refreshMockAccessToken(): AuthSessionSnapshot {
  if (!activeSession || hasExpired(activeSession.expiresAt)) {
    activeSession = null
    activeAccessToken = null
    activeCsrfToken = null
    throw createMockError(API_ERROR_CODE.authenticationRequired)
  }

  activeAccessToken = {
    value: `mock.${createMockId("jwt")}.unsigned`,
    tokenType: "Bearer",
    expiresAt: createExpiry(MOCK_ACCESS_TOKEN_TTL_MS),
    mockOnly: true,
  }
  return createSessionSnapshot()
}

/** 要求当前 Mock 标签页已经建立未过期的认证会话。 */
function assertAuthenticatedSession(): void {
  if (!createSessionSnapshot().session) {
    throw createMockError(API_ERROR_CODE.authenticationRequired)
  }
}

/** 读取浏览器当前来源，为二维码构造项目自己的确认地址。 */
function getBrowserOrigin(): string {
  return typeof window === "undefined"
    ? "http://localhost"
    : window.location.origin
}

/** 在当前标签页存在挑战时应用来自移动确认页的状态。 */
function applyQrMessage(message: MockQrMessage): void {
  const record = qrLoginRecords.get(message.challengeId)

  if (!record || hasExpired(record.challenge.expiresAt)) {
    return
  }

  let authentication = record.authentication

  if (message.status === QR_LOGIN_STATUS.approved && !authentication) {
    authentication = createAuthentication(
      {
        id: createMockId("qr-user"),
        username: "Mock QR User",
        email: "qr-user@example.invalid",
      },
      AUTHENTICATION_METHOD.qrCode
    )
  }

  qrLoginRecords.set(message.challengeId, {
    challenge: { ...record.challenge, status: message.status },
    authentication,
  })
}

/** 校验跨标签页消息后更新桌面端扫码挑战。 */
function handleQrChannelMessage(event: MessageEvent<unknown>): void {
  if (typeof event.data !== "object" || event.data === null) {
    return
  }

  const challengeId: unknown = Reflect.get(event.data, "challengeId")
  const status: unknown = Reflect.get(event.data, "status")

  if (typeof challengeId === "string" && isQrLoginStatus(status)) {
    applyQrMessage({ challengeId, status })
  }
}

qrChannel?.addEventListener("message", handleQrChannelMessage)

/** 将移动端产生的扫码状态同步给桌面端标签页。 */
function publishQrStatus(message: MockQrMessage): void {
  applyQrMessage(message)
  qrChannel?.postMessage(message)
}

/** 项目完整认证契约的内存 Mock 实现。 */
export const mockAuthGateway = {
  /** 使用验证码与凭据建立内存 Session 和短期 Mock JWT。 */
  async signIn(credentials: LoginCredentials) {
    verifyCode(credentials.email, "login", credentials.verificationCode)
    const user = findCredentialUser(credentials)
    return createMockResponse(
      createAuthentication(user, AUTHENTICATION_METHOD.credentials)
    )
  },

  /** 在当前内存生命周期创建账号。 */
  async register(input: RegistrationInput) {
    verifyCode(input.email, "registration", input.verificationCode)
    const email = normalizeEmail(input.email)

    if (accounts.has(email)) {
      throw createMockError(API_ERROR_CODE.requestConflict)
    }

    const user: AuthUser = {
      id: createMockId("user"),
      username: input.username.trim(),
      email,
    }
    accounts.set(email, { user, password: input.password })
    return createMockResponse({ registered: true, userId: user.id } as const)
  },

  /** 为当前邮箱与用途写入可完整演练的 Mock 验证码。 */
  async requestVerificationCode(input: VerificationCodeRequest) {
    if (normalizeEmail(input.email) === MOCK_FAILURE_EMAIL) {
      throw createMockError(API_ERROR_CODE.networkUnavailable)
    }

    const expiresAt = Date.now() + MOCK_VERIFICATION_CODE_TTL_MS
    verificationCodes.set(createVerificationKey(input.email, input.purpose), {
      code: MOCK_VERIFICATION_CODE,
      expiresAt,
    })
    return createMockResponse({
      sent: true,
      expiresAt: new Date(expiresAt).toISOString(),
      previewCode: MOCK_VERIFICATION_CODE,
    } as const)
  },

  /** 校验找回密码验证码并在内存中签发单用途授权。 */
  async verifyPasswordReset(input: PasswordResetVerificationInput) {
    verifyCode(input.email, "passwordReset", input.verificationCode)
    const authorizationId = createMockId("password-reset")
    const expiresAt = Date.now() + MOCK_PASSWORD_RESET_TTL_MS
    passwordResetAuthorizations.set(authorizationId, {
      email: normalizeEmail(input.email),
      expiresAt,
    })
    return createMockResponse({
      authorizationId,
      expiresAt: new Date(expiresAt).toISOString(),
    })
  },

  /** 消费 Mock 短期授权并更新当前内存账号密码。 */
  async resetPassword(input: PasswordResetInput) {
    const authorization = passwordResetAuthorizations.get(input.authorizationId)

    if (!authorization || authorization.expiresAt <= Date.now()) {
      throw createMockError(API_ERROR_CODE.authenticationRequired)
    }

    const account = accounts.get(authorization.email)
    if (account) account.password = input.newPassword
    passwordResetAuthorizations.delete(input.authorizationId)
    return createMockResponse({ reset: true } as const)
  },

  /** 返回项目内的 Mock GitHub 回调地址以演练完整跳转。 */
  async startGithubSignIn() {
    const callbackUrl = new URL("/auth/github/callback", getBrowserOrigin())
    callbackUrl.searchParams.set("code", MOCK_GITHUB_CODE)
    callbackUrl.searchParams.set("state", MOCK_GITHUB_STATE)
    return createMockResponse({ authorizationUrl: callbackUrl.toString() })
  },

  /** 校验 Mock GitHub 回调并建立认证状态。 */
  async completeGithubSignIn(input: GithubCallbackInput) {
    if (input.code !== MOCK_GITHUB_CODE || input.state !== MOCK_GITHUB_STATE) {
      throw createMockError(API_ERROR_CODE.accessDenied)
    }

    return createMockResponse(
      createAuthentication(
        {
          id: "mock-github-user",
          username: "Mock GitHub User",
          email: "github-user@example.invalid",
        },
        AUTHENTICATION_METHOD.github
      )
    )
  },

  /** 返回当前内存 Session、JWT 与 CSRF Token 快照。 */
  async getSession() {
    return createMockResponse(createSessionSnapshot())
  },

  /** 使用内存 Session 重新签发短期 Mock JWT。 */
  async refreshAccessToken() {
    return createMockResponse(refreshMockAccessToken())
  },

  /** 清除当前内存 Session、JWT 与 CSRF Token。 */
  async signOut() {
    activeSession = null
    activeAccessToken = null
    activeCsrfToken = null
    return createMockResponse(createSessionSnapshot())
  },

  /** 创建项目自有扫码登录挑战与确认地址。 */
  async createQrLoginChallenge() {
    const challengeId = createMockId("qr")
    const confirmationUrl = new URL("/auth/qr-confirm", getBrowserOrigin())
    confirmationUrl.searchParams.set("challenge", challengeId)
    const challenge: QrLoginChallenge = {
      challengeId,
      confirmationUrl: confirmationUrl.toString(),
      status: QR_LOGIN_STATUS.waitingForScan,
      expiresAt: createExpiry(MOCK_QR_LOGIN_TTL_MS),
      mockOnly: true,
    }
    qrLoginRecords.set(challengeId, { challenge })
    return createMockResponse(challenge)
  },

  /** 将扫码挑战更新为等待移动端确认。 */
  async markQrLoginScanned(input: QrLoginChallengeInput) {
    assertAuthenticatedSession()
    const status = QR_LOGIN_STATUS.waitingForConfirmation
    publishQrStatus({ challengeId: input.challengeId, status })
    return createMockResponse({ status })
  },

  /** 将移动端允许或拒绝决定同步给桌面端。 */
  async decideQrLogin(input: QrLoginDecisionInput) {
    assertAuthenticatedSession()
    const status = input.approved
      ? QR_LOGIN_STATUS.approved
      : QR_LOGIN_STATUS.rejected
    publishQrStatus({ challengeId: input.challengeId, status })
    return createMockResponse({ status })
  },

  /** 返回扫码挑战状态，并在允许后附带认证结果。 */
  async getQrLoginStatus(input: QrLoginChallengeInput) {
    const record = qrLoginRecords.get(input.challengeId)

    if (!record) {
      return createMockResponse({ status: QR_LOGIN_STATUS.expired })
    }

    if (hasExpired(record.challenge.expiresAt)) {
      const expiredRecord: MockQrLoginRecord = {
        challenge: {
          ...record.challenge,
          status: QR_LOGIN_STATUS.expired,
        },
      }
      qrLoginRecords.set(input.challengeId, expiredRecord)
      return createMockResponse({ status: QR_LOGIN_STATUS.expired })
    }

    const result: QrLoginStatusResult = {
      status: record.challenge.status,
      ...(record.authentication
        ? { authentication: record.authentication }
        : {}),
    }
    return createMockResponse(result)
  },
} satisfies AuthGateway
