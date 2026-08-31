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
  VerificationCodeRequest,
  VerificationCodeResult,
} from "@/auth/types"

/** Mock 与真实后端必须共同实现的完整认证能力。 */
export interface AuthGateway {
  /** 使用账号凭据建立 Session，并签发短期 JWT 与 CSRF Token。 */
  signIn(
    credentials: LoginCredentials
  ): AuthServiceResponse<AuthenticationResult>

  /** 使用已验证的邮箱资料创建账户。 */
  register(input: RegistrationInput): AuthServiceResponse<RegistrationResult>

  /** 根据用途向邮箱发送一次性验证码。 */
  requestVerificationCode(
    input: VerificationCodeRequest
  ): AuthServiceResponse<VerificationCodeResult>

  /** 校验找回密码验证码并签发单用途短期授权。 */
  verifyPasswordReset(
    input: PasswordResetVerificationInput
  ): AuthServiceResponse<PasswordResetAuthorization>

  /** 使用短期授权更新密码并消费授权。 */
  resetPassword(
    input: PasswordResetInput
  ): AuthServiceResponse<PasswordResetResult>

  /** 获取 GitHub OAuth 授权跳转地址。 */
  startGithubSignIn(): AuthServiceResponse<GithubAuthorization>

  /** 使用 GitHub 回调参数完成登录。 */
  completeGithubSignIn(
    input: GithubCallbackInput
  ): AuthServiceResponse<AuthenticationResult>

  /** 恢复当前 Cookie Session、短期 JWT 与 CSRF Token。 */
  getSession(): AuthServiceResponse<AuthSessionSnapshot>

  /** 使用 Session 刷新短期 JWT。 */
  refreshAccessToken(): AuthServiceResponse<AuthSessionSnapshot>

  /** 注销当前 Session 并撤销访问令牌。 */
  signOut(): AuthServiceResponse<AuthSessionSnapshot>

  /** 为桌面端创建一次扫码登录挑战。 */
  createQrLoginChallenge(): AuthServiceResponse<QrLoginChallenge>

  /** 标记移动设备已经扫描指定挑战。 */
  markQrLoginScanned(
    input: QrLoginChallengeInput
  ): AuthServiceResponse<QrLoginDecisionResult>

  /** 由移动设备允许或拒绝指定挑战。 */
  decideQrLogin(
    input: QrLoginDecisionInput
  ): AuthServiceResponse<QrLoginDecisionResult>

  /** 由桌面端查询扫码挑战状态并接收登录结果。 */
  getQrLoginStatus(
    input: QrLoginChallengeInput
  ): AuthServiceResponse<QrLoginStatusResult>
}
