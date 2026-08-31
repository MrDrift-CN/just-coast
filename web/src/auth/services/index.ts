/**
 * Auth 功能内部服务边界。
 *
 * @remarks
 * 仅允许 `auth/routes.tsx` 与 `auth/session.ts` 使用；其他业务统一从 `@/auth`
 * 读取公开 Session，或从 `@/api` 发起受认证保护的请求。
 */

import { authGateway, AUTH_DATA_SOURCE } from "@/auth/services/gateway"
import type {
  AuthenticationResult,
  AuthServiceResponse,
  AuthSessionSnapshot,
  GithubAuthorization,
  GithubCallbackInput,
  LoginCredentials,
  PasswordResetAuthorization,
  PasswordResetInput,
  PasswordResetResult,
  PasswordResetVerificationInput,
  QrLoginChallenge,
  QrLoginChallengeInput,
  QrLoginDecisionInput,
  QrLoginDecisionResult,
  QrLoginStatusResult,
  RegistrationInput,
  RegistrationResult,
  VerificationCodeResult,
  VerificationCodeRequest,
} from "@/auth/types"

/** 当前认证服务是否使用完整内存 Mock。 */
export const IS_AUTH_MOCK_ENABLED = AUTH_DATA_SOURCE === "mock"

/**
 * 使用账号字段、密码和邮箱验证码建立认证会话。
 *
 * @example
 * ```ts
 * const response = await signIn({
 *   username,
 *   email,
 *   password,
 *   verificationCode,
 * })
 * session.establish(response.data)
 * ```
 */
export function signIn(
  credentials: LoginCredentials
): AuthServiceResponse<AuthenticationResult> {
  return authGateway.signIn(credentials)
}

/** 使用已验证的邮箱资料创建新账户。 */
export function registerAccount(
  input: RegistrationInput
): AuthServiceResponse<RegistrationResult> {
  return authGateway.register(input)
}

/**
 * 根据认证场景向指定邮箱发送一次性验证码。
 *
 * @example
 * ```ts
 * const response = await requestVerificationCode({
 *   email,
 *   purpose: "login",
 * })
 * ```
 */
export function requestVerificationCode(
  input: VerificationCodeRequest
): AuthServiceResponse<VerificationCodeResult> {
  return authGateway.requestVerificationCode(input)
}

/** 校验找回密码验证码并取得单用途短期授权。 */
export function verifyPasswordReset(
  input: PasswordResetVerificationInput
): AuthServiceResponse<PasswordResetAuthorization> {
  return authGateway.verifyPasswordReset(input)
}

/** 使用短期授权提交新密码并结束找回密码流程。 */
export function resetPassword(
  input: PasswordResetInput
): AuthServiceResponse<PasswordResetResult> {
  return authGateway.resetPassword(input)
}

/** 获取 GitHub OAuth 授权地址。 */
export function startGithubSignIn(): AuthServiceResponse<GithubAuthorization> {
  return authGateway.startGithubSignIn()
}

/** 使用 GitHub 回调参数完成登录。 */
export function completeGithubSignIn(
  input: GithubCallbackInput
): AuthServiceResponse<AuthenticationResult> {
  return authGateway.completeGithubSignIn(input)
}

/**
 * 获取当前 Session 与 JWT 快照。
 *
 * @example
 * ```ts
 * const { data } = await getCurrentSession()
 * if (data.session) renderAccount(data.session.user)
 * ```
 */
export function getCurrentSession(): AuthServiceResponse<AuthSessionSnapshot> {
  return authGateway.getSession()
}

/** 使用 Cookie Session 刷新短期 JWT。 */
export function refreshAuthAccessToken(): AuthServiceResponse<AuthSessionSnapshot> {
  return authGateway.refreshAccessToken()
}

/** 注销当前 Session。 */
export function signOut(): AuthServiceResponse<AuthSessionSnapshot> {
  return authGateway.signOut()
}

/**
 * 创建项目自有扫码登录挑战。
 *
 * @example
 * ```ts
 * const { data } = await createQrLoginChallenge()
 * renderQrCode(data.confirmationUrl)
 * ```
 */
export function createQrLoginChallenge(): AuthServiceResponse<QrLoginChallenge> {
  return authGateway.createQrLoginChallenge()
}

/** 标记移动设备已经扫描扫码登录挑战。 */
export function markQrLoginScanned(
  input: QrLoginChallengeInput
): AuthServiceResponse<QrLoginDecisionResult> {
  return authGateway.markQrLoginScanned(input)
}

/** 由移动设备允许或拒绝扫码登录挑战。 */
export function decideQrLogin(
  input: QrLoginDecisionInput
): AuthServiceResponse<QrLoginDecisionResult> {
  return authGateway.decideQrLogin(input)
}

/** 查询扫码登录挑战状态。 */
export function getQrLoginStatus(
  input: QrLoginChallengeInput
): AuthServiceResponse<QrLoginStatusResult> {
  return authGateway.getQrLoginStatus(input)
}

/** 将登录结果转换为 Session 运行时保存的完整内存快照。 */
export function createAuthenticationSnapshot(
  result: AuthenticationResult
): AuthSessionSnapshot {
  return {
    session: result.session,
    accessToken: result.accessToken,
    csrfToken: result.csrfToken,
  }
}
