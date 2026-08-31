import type { ApiResponse } from "@/api"

/** 可由认证界面调用的同步或异步动作。 */
export type AuthFormAction<TValues, TResult = void> = (
  values: TValues
) => TResult | Promise<TResult>

/** 认证成功时记录的登录方式。 */
export const AUTHENTICATION_METHOD = {
  /** 用户名、邮箱、密码和验证码登录。 */
  credentials: "credentials",
  /** GitHub OAuth 登录。 */
  github: "github",
  /** 项目自有的跨设备扫码确认登录。 */
  qrCode: "qrCode",
} as const

/** 项目支持的登录方式值。 */
export type AuthenticationMethod =
  (typeof AUTHENTICATION_METHOD)[keyof typeof AUTHENTICATION_METHOD]

/** 登录和注册界面提供的备选登录入口。 */
export const ALTERNATIVE_LOGIN_METHOD = {
  /** 项目自有扫码确认登录。 */
  qrCode: AUTHENTICATION_METHOD.qrCode,
  /** GitHub OAuth 登录。 */
  github: AUTHENTICATION_METHOD.github,
} as const

/** 备选登录入口的稳定标识。 */
export type AlternativeLoginMethod =
  (typeof ALTERNATIVE_LOGIN_METHOD)[keyof typeof ALTERNATIVE_LOGIN_METHOD]

/** 验证码请求所属的认证场景。 */
export const VERIFICATION_CODE_PURPOSE = {
  /** 登录前验证账号邮箱。 */
  login: "login",
  /** 创建新账户前验证邮箱所有权。 */
  registration: "registration",
  /** 找回密码前验证邮箱所有权。 */
  passwordReset: "passwordReset",
} as const

/** 验证码请求支持的认证场景值。 */
export type VerificationCodePurpose =
  (typeof VERIFICATION_CODE_PURPOSE)[keyof typeof VERIFICATION_CODE_PURPOSE]

/** 登录接口接收的账号凭据。 */
export interface LoginCredentials {
  /** 用户用于显示和账号识别的名称。 */
  readonly username: string
  /** 用户用于认证和接收账号通知的邮箱地址。 */
  readonly email: string
  /** 尚未发送到服务端的原始密码，不得记录或持久化。 */
  readonly password: string
  /** 发送到当前登录邮箱的一次性验证码。 */
  readonly verificationCode: string
}

/** 注册接口接收的新账户资料。 */
export interface RegistrationInput {
  /** 新账户用于显示和账号识别的名称。 */
  readonly username: string
  /** 新账户用于认证和接收通知的邮箱地址。 */
  readonly email: string
  /** 尚未发送到服务端的原始密码，不得记录或持久化。 */
  readonly password: string
  /** 发送到当前注册邮箱的一次性验证码。 */
  readonly verificationCode: string
}

/** 请求认证验证码需要的邮箱和使用场景。 */
export interface VerificationCodeRequest {
  /** 接收一次性验证码的邮箱地址。 */
  readonly email: string
  /** 服务端用于隔离验证码用途的认证场景。 */
  readonly purpose: VerificationCodePurpose
}

/** 找回密码进入设置新密码阶段前需要校验的字段。 */
export interface PasswordResetVerificationInput {
  /** 用于定位账户和接收验证码的邮箱地址。 */
  readonly email: string
  /** 发送到当前找回邮箱的一次性验证码。 */
  readonly verificationCode: string
}

/** 完成密码重置所需的短期授权和新密码。 */
export interface PasswordResetInput {
  /** 验证邮箱后由服务端签发的单用途短期授权。 */
  readonly authorizationId: string
  /** 尚未发送到服务端的新密码，不得记录或持久化。 */
  readonly newPassword: string
}

/** 已认证用户向其他业务层公开的安全资料。 */
export interface AuthUser {
  /** 后端生成的稳定用户标识。 */
  readonly id: string
  /** 用户公开显示名称。 */
  readonly username: string
  /** 当前账号绑定的邮箱地址。 */
  readonly email: string
  /** 可选的公开头像地址。 */
  readonly avatarUrl?: string
}

/** 浏览器使用 HttpOnly Cookie 维持的服务端 Session 摘要。 */
export interface AuthSession {
  /** 当前会话对应的用户资料。 */
  readonly user: AuthUser
  /** 建立当前会话的登录方式。 */
  readonly authenticationMethod: AuthenticationMethod
  /** ISO 8601 格式的服务端 Session 过期时间。 */
  readonly expiresAt: string
}

/** 供 Chat、SSE 等 API 请求使用的短期 JWT。 */
export interface JwtAccessToken {
  /** 放入 Authorization 请求头的短期访问令牌。 */
  readonly value: string
  /** 固定使用 Bearer 认证方案。 */
  readonly tokenType: "Bearer"
  /** ISO 8601 格式的令牌过期时间。 */
  readonly expiresAt: string
  /** 是否为仅供本地开发使用、不可发送给真实服务的模拟令牌。 */
  readonly mockOnly: boolean
}

/** 登录完成后同时返回的 Session 摘要、短期 JWT 与 CSRF Token。 */
export interface AuthenticationResult {
  /** 成功结果的固定判别字段。 */
  readonly authenticated: true
  /** 由服务端 Cookie 维持的会话摘要。 */
  readonly session: AuthSession
  /** 供显式 Bearer 认证消费者使用的短期访问令牌。 */
  readonly accessToken: JwtAccessToken
  /** 仅保存在内存、用于保护 Cookie 写操作的 CSRF Token。 */
  readonly csrfToken: string
}

/** 当前浏览器可恢复的认证状态。 */
export interface AuthSessionSnapshot {
  /** 当前服务端会话；未登录时为空。 */
  readonly session: AuthSession | null
  /** 当前短期 JWT；未登录时为空。 */
  readonly accessToken: JwtAccessToken | null
  /** 当前 CSRF Token；匿名 Session 也可提供，但始终不得持久化。 */
  readonly csrfToken: string | null
}

/** 新账户创建完成后的结果。 */
export interface RegistrationResult {
  /** 当前注册请求是否已经创建账户。 */
  readonly registered: true
  /** 新账户的稳定用户标识。 */
  readonly userId: string
}

/** 验证码发送请求完成后的结果。 */
export interface VerificationCodeResult {
  /** 服务端是否已接受当前验证码发送请求。 */
  readonly sent: true
  /** ISO 8601 格式的验证码过期时间。 */
  readonly expiresAt: string
  /** 仅在 Mock 模式展示、帮助前端完整演练流程的验证码。 */
  readonly previewCode?: string
}

/** 邮箱验证码校验成功后签发的密码重置授权。 */
export interface PasswordResetAuthorization {
  /** 仅用于一次密码重置的短期授权标识。 */
  readonly authorizationId: string
  /** ISO 8601 格式的短期授权过期时间。 */
  readonly expiresAt: string
}

/** 新密码写入完成后的结果。 */
export interface PasswordResetResult {
  /** 当前密码重置操作是否已经完成。 */
  readonly reset: true
}

/** GitHub OAuth 登录启动结果。 */
export interface GithubAuthorization {
  /** 需要在浏览器中打开的 GitHub 授权地址。 */
  readonly authorizationUrl: string
}

/** GitHub OAuth 回调携带的一次性参数。 */
export interface GithubCallbackInput {
  /** GitHub 返回的一次性授权码。 */
  readonly code: string
  /** 用于防止登录请求伪造的随机状态值。 */
  readonly state: string
}

/** 扫码登录挑战的状态。 */
export const QR_LOGIN_STATUS = {
  /** 二维码已生成，等待移动设备扫描。 */
  waitingForScan: "waitingForScan",
  /** 移动设备已扫描，等待用户确认。 */
  waitingForConfirmation: "waitingForConfirmation",
  /** 移动设备已经允许本次登录。 */
  approved: "approved",
  /** 用户拒绝本次登录。 */
  rejected: "rejected",
  /** 二维码已经过期。 */
  expired: "expired",
} as const

/** 扫码登录挑战的状态值。 */
export type QrLoginStatus =
  (typeof QR_LOGIN_STATUS)[keyof typeof QR_LOGIN_STATUS]

/** 桌面端创建的扫码登录挑战。 */
export interface QrLoginChallenge {
  /** 后端生成的短期挑战标识。 */
  readonly challengeId: string
  /** 编码进二维码、由移动设备打开的项目确认地址。 */
  readonly confirmationUrl: string
  /** 当前挑战状态。 */
  readonly status: QrLoginStatus
  /** ISO 8601 格式的挑战过期时间。 */
  readonly expiresAt: string
  /** 是否为本地 Mock 挑战。 */
  readonly mockOnly: boolean
}

/** 查询扫码挑战状态时返回的数据。 */
export interface QrLoginStatusResult {
  /** 当前挑战状态。 */
  readonly status: QrLoginStatus
  /** 移动端确认后返回给桌面端的认证结果。 */
  readonly authentication?: AuthenticationResult
}

/** 移动端扫码动作需要的挑战标识。 */
export interface QrLoginChallengeInput {
  /** 二维码携带的短期挑战标识。 */
  readonly challengeId: string
}

/** 移动端确认或拒绝扫码登录的输入。 */
export interface QrLoginDecisionInput extends QrLoginChallengeInput {
  /** 用户是否允许桌面端登录。 */
  readonly approved: boolean
}

/** 移动端处理扫码挑战后的结果。 */
export interface QrLoginDecisionResult {
  /** 决策后的挑战状态。 */
  readonly status: QrLoginStatus
}

/** 认证服务动作统一返回的响应信封。 */
export type AuthServiceResponse<TData> = Promise<ApiResponse<TData>>
