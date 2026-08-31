import { API_REQUEST_METHOD, request, REQUEST_AUTH_MODE } from "@/api"
import type { AuthGateway } from "@/auth/services/contract"
import {
  parseAuthenticationResult,
  parseAuthSessionSnapshot,
  parseGithubAuthorization,
  parsePasswordResetAuthorization,
  parsePasswordResetResult,
  parseQrLoginChallenge,
  parseQrLoginDecisionResult,
  parseQrLoginStatusResult,
  parseRegistrationResult,
  parseVerificationCodeResult,
} from "@/auth/services/parsers"

/** 普通认证请求允许等待的毫秒数。 */
const AUTH_REQUEST_TIMEOUT_MS = 10_000

/** OAuth 与扫码状态请求允许等待的毫秒数。 */
const AUTH_FLOW_TIMEOUT_MS = 15_000

/** 编码扫码挑战标识，避免动态路径改变接口边界。 */
function createQrChallengePath(challengeId: string, action = ""): string {
  const suffix = action ? `/${action}` : ""
  return `/api/auth/qr-login/${encodeURIComponent(challengeId)}${suffix}`
}

/** 项目认证契约的真实后端实现；通过 Cookie Session 和短期 JWT 工作。 */
export const apiAuthGateway = {
  /** 提交账号凭据并接收 Session、短期 JWT 与 CSRF Token。 */
  signIn(credentials) {
    return request("/api/auth/sign-in", {
      method: API_REQUEST_METHOD.post,
      json: credentials,
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.session,
      parseData: parseAuthenticationResult,
    })
  },

  /** 创建已完成邮箱验证的新账户。 */
  register(input) {
    return request("/api/auth/register", {
      method: API_REQUEST_METHOD.post,
      json: input,
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.public,
      parseData: parseRegistrationResult,
    })
  },

  /** 请求发送指定用途的一次性验证码。 */
  requestVerificationCode(input) {
    return request("/api/auth/verification-codes", {
      method: API_REQUEST_METHOD.post,
      json: input,
      authMode: REQUEST_AUTH_MODE.public,
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
      parseData: parseVerificationCodeResult,
    })
  },

  /** 校验找回密码验证码并取得短期授权。 */
  verifyPasswordReset(input) {
    return request("/api/auth/password-reset/verification", {
      method: API_REQUEST_METHOD.post,
      json: input,
      authMode: REQUEST_AUTH_MODE.public,
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
      parseData: parsePasswordResetAuthorization,
    })
  },

  /** 使用短期授权完成密码重置。 */
  resetPassword(input) {
    return request("/api/auth/password-reset", {
      method: API_REQUEST_METHOD.post,
      json: input,
      authMode: REQUEST_AUTH_MODE.public,
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
      parseData: parsePasswordResetResult,
    })
  },

  /** 获取绑定 HttpOnly Cookie、state 与 PKCE 的 GitHub 授权地址。 */
  startGithubSignIn() {
    return request("/api/auth/github/authorization", {
      method: API_REQUEST_METHOD.post,
      timeoutMs: AUTH_FLOW_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.session,
      parseData: parseGithubAuthorization,
    })
  },

  /** 将 GitHub 回调参数交给后端校验并建立 Session。 */
  completeGithubSignIn(input) {
    return request("/api/auth/github/callback", {
      method: API_REQUEST_METHOD.post,
      json: input,
      timeoutMs: AUTH_FLOW_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.session,
      parseData: parseAuthenticationResult,
    })
  },

  /** 通过 HttpOnly Cookie 恢复 Session、短期 JWT 与 CSRF Token。 */
  getSession() {
    return request("/api/auth/session", {
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.session,
      parseData: parseAuthSessionSnapshot,
    })
  },

  /** 使用 Cookie Session 刷新短期 JWT。 */
  refreshAccessToken() {
    return request("/api/auth/token", {
      method: API_REQUEST_METHOD.post,
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.session,
      requiresCsrf: true,
      parseData: parseAuthSessionSnapshot,
    })
  },

  /** 注销 Cookie Session 并撤销服务端令牌。 */
  signOut() {
    return request("/api/auth/sign-out", {
      method: API_REQUEST_METHOD.post,
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.session,
      requiresCsrf: true,
      parseData: parseAuthSessionSnapshot,
    })
  },

  /** 创建自有扫码登录挑战。 */
  createQrLoginChallenge() {
    return request("/api/auth/qr-login", {
      method: API_REQUEST_METHOD.post,
      timeoutMs: AUTH_FLOW_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.session,
      requiresCsrf: true,
      parseData: parseQrLoginChallenge,
    })
  },

  /** 通知后端移动设备已经扫描挑战。 */
  markQrLoginScanned(input) {
    return request(createQrChallengePath(input.challengeId, "scan"), {
      method: API_REQUEST_METHOD.post,
      timeoutMs: AUTH_FLOW_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.required,
      requiresCsrf: true,
      parseData: parseQrLoginDecisionResult,
    })
  },

  /** 由移动端允许或拒绝桌面登录。 */
  decideQrLogin(input) {
    return request(createQrChallengePath(input.challengeId, "decision"), {
      method: API_REQUEST_METHOD.post,
      json: { approved: input.approved },
      timeoutMs: AUTH_FLOW_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.required,
      requiresCsrf: true,
      parseData: parseQrLoginDecisionResult,
    })
  },

  /** 由桌面端查询扫码挑战并在确认后接收认证结果。 */
  getQrLoginStatus(input) {
    return request(createQrChallengePath(input.challengeId), {
      timeoutMs: AUTH_FLOW_TIMEOUT_MS,
      authMode: REQUEST_AUTH_MODE.session,
      parseData: parseQrLoginStatusResult,
    })
  },
} satisfies AuthGateway
