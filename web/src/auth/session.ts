import { API_ERROR_CODE, ApiError, isApiError } from "@/api"
import {
  registerRequestAuthenticationProvider,
  type RequestAuthenticationIdentity,
} from "@/api/authentication"
import {
  createAuthenticationSnapshot,
  getCurrentSession,
  refreshAuthAccessToken,
  signOut,
} from "@/auth/services"
import type { AuthenticationResult, AuthSessionSnapshot } from "@/auth/types"

/** Session 运行时对 React 与其他订阅者公开的状态。 */
export type SessionStatus =
  | "initializing"
  | "anonymous"
  | "authenticated"
  | "refreshing"
  | "expired"
  | "unavailable"

/** Session 运行时的不可变状态快照。 */
export interface SessionState {
  /** 当前认证生命周期阶段。 */
  readonly status: SessionStatus
  /** 当前仅保存在内存中的 Session、JWT 与 CSRF Token。 */
  readonly snapshot: AuthSessionSnapshot
}

/** Session 状态变化时执行的订阅回调。 */
export type SessionListener = () => void

/** 跨标签页只发送事件、不发送令牌的消息类型。 */
const SESSION_SYNC_EVENT = {
  /** 其他标签页应通过 Cookie Session 重新恢复状态。 */
  changed: "changed",
  /** 其他标签页应立即清除敏感内存状态。 */
  signedOut: "signedOut",
} as const

/** 跨标签页同步认证事件的通道名称。 */
const SESSION_CHANNEL_NAME = "just-coast-auth-session"

/** 完全匿名时使用的空认证快照。 */
const EMPTY_SESSION_SNAPSHOT: AuthSessionSnapshot = {
  session: null,
  accessToken: null,
  csrfToken: null,
}

/** 当前页面内存中的唯一 Session 状态。 */
let sessionState: SessionState = {
  status: "initializing",
  snapshot: EMPTY_SESSION_SNAPSHOT,
}

/** 当前页面订阅 Session 变化的监听器。 */
const sessionListeners = new Set<SessionListener>()

/** 首次恢复 Session 时复用的并发请求。 */
let initializationRequest: Promise<void> | null = null

/** JWT 刷新时复用的单飞请求。 */
let accessTokenRefreshRequest: Promise<RequestAuthenticationIdentity> | null =
  null

/** 用于阻止旧恢复或刷新响应覆盖新登录、注销状态的版本号。 */
let sessionEpoch = 0

/** 浏览器支持时使用的跨标签页认证事件通道。 */
const sessionChannel =
  typeof BroadcastChannel === "undefined"
    ? null
    : new BroadcastChannel(SESSION_CHANNEL_NAME)

/** 规范化匿名快照，移除 JWT 并保留服务端签发的匿名 CSRF Token。 */
function normalizeSessionSnapshot(
  snapshot: AuthSessionSnapshot
): AuthSessionSnapshot {
  if (!snapshot.session) {
    return {
      session: null,
      accessToken: null,
      csrfToken: snapshot.csrfToken,
    }
  }
  return snapshot
}

/** 根据 Session 快照推导稳定状态。 */
function getSnapshotStatus(snapshot: AuthSessionSnapshot): SessionStatus {
  return snapshot.session ? "authenticated" : "anonymous"
}

/** 替换唯一状态快照并通知全部订阅者。 */
function updateSessionState(nextState: SessionState): void {
  sessionState = nextState
  for (const listener of sessionListeners) listener()
}

/** 将当前 Session 变化作为无凭据事件通知其他标签页。 */
function publishSessionEvent(
  event: (typeof SESSION_SYNC_EVENT)[keyof typeof SESSION_SYNC_EVENT]
): void {
  sessionChannel?.postMessage({ event })
}

/** 将当前内存状态转换为 API 认证层需要的最小身份。 */
function readRequestAuthenticationIdentity(): RequestAuthenticationIdentity {
  return {
    userId: sessionState.snapshot.session?.user.id ?? null,
    accessToken: sessionState.snapshot.accessToken,
    csrfToken: sessionState.snapshot.csrfToken,
  }
}

/** 把服务端快照写入运行时并按需通知其他标签页。 */
function applySessionSnapshot(
  snapshot: AuthSessionSnapshot,
  broadcast: boolean
): void {
  const normalizedSnapshot = normalizeSessionSnapshot(snapshot)
  updateSessionState({
    status: getSnapshotStatus(normalizedSnapshot),
    snapshot: normalizedSnapshot,
  })
  if (broadcast) publishSessionEvent(SESSION_SYNC_EVENT.changed)
}

/** 判断恢复失败是否代表不存在有效 Session。 */
function isAnonymousSessionError(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.code === API_ERROR_CODE.authenticationRequired ||
      error.code === API_ERROR_CODE.sessionExpired)
  )
}

/** 从 Cookie Session 恢复最新快照，不向其他标签页重复广播。 */
async function restoreSession(): Promise<void> {
  const requestEpoch = sessionEpoch
  try {
    const response = await getCurrentSession()
    if (requestEpoch !== sessionEpoch) return
    applySessionSnapshot(response.data, false)
  } catch (error) {
    if (requestEpoch !== sessionEpoch) return
    updateSessionState({
      status: isAnonymousSessionError(error) ? "anonymous" : "unavailable",
      snapshot: EMPTY_SESSION_SNAPSHOT,
    })
  }
}

/** 强制刷新 JWT，并确保并发调用只产生一次后端请求。 */
async function refreshAccessTokenOnce(): Promise<RequestAuthenticationIdentity> {
  if (accessTokenRefreshRequest) return accessTokenRefreshRequest

  const requestEpoch = sessionEpoch
  updateSessionState({ ...sessionState, status: "refreshing" })
  accessTokenRefreshRequest = refreshAuthAccessToken()
    .then((response) => {
      if (requestEpoch !== sessionEpoch) {
        return readRequestAuthenticationIdentity()
      }
      const snapshot = normalizeSessionSnapshot(response.data)
      if (!snapshot.session || !snapshot.accessToken) {
        throw new ApiError({ code: API_ERROR_CODE.authenticationRequired })
      }
      applySessionSnapshot(snapshot, false)
      return readRequestAuthenticationIdentity()
    })
    .catch((error: unknown) => {
      if (requestEpoch === sessionEpoch) expireSession()
      throw error
    })
    .finally(() => {
      accessTokenRefreshRequest = null
    })

  return accessTokenRefreshRequest
}

/** 校验跨标签页消息后执行恢复或本地清理。 */
function handleSessionChannelMessage(event: MessageEvent<unknown>): void {
  if (typeof event.data !== "object" || event.data === null) return
  const syncEvent: unknown = Reflect.get(event.data, "event")

  if (syncEvent === SESSION_SYNC_EVENT.signedOut) {
    sessionEpoch += 1
    updateSessionState({
      status: "anonymous",
      snapshot: EMPTY_SESSION_SNAPSHOT,
    })
  } else if (syncEvent === SESSION_SYNC_EVENT.changed) {
    void restoreSession()
  }
}

/** 页面重新可见时通过 Cookie Session 校准内存状态。 */
function handleVisibilityChange(): void {
  if (document.visibilityState === "visible") {
    void restoreSession()
  }
}

/** 读取当前不可变 Session 状态，供 useSyncExternalStore 使用。 */
export function getSessionState(): SessionState {
  return sessionState
}

/** 订阅 Session 状态变化并返回取消订阅函数。 */
export function subscribeSession(listener: SessionListener): () => void {
  sessionListeners.add(listener)
  return () => sessionListeners.delete(listener)
}

/** 首次恢复 Cookie Session；重复调用复用同一个初始化请求。 */
export function initializeSession(): Promise<void> {
  if (!initializationRequest) {
    initializationRequest = restoreSession().finally(() => {
      initializationRequest = null
    })
  }
  return initializationRequest
}

/** 登录、GitHub 或扫码完成后接收完整认证结果。 */
export function establishSession(result: AuthenticationResult): void {
  sessionEpoch += 1
  applySessionSnapshot(createAuthenticationSnapshot(result), true)
}

/** 主动从 Cookie Session 重新加载状态。 */
export function refreshSession(): Promise<void> {
  return restoreSession()
}

/** 将当前 Session 标记为过期并清除 JWT 与 CSRF Token。 */
export function expireSession(): void {
  sessionEpoch += 1
  updateSessionState({
    status: "expired",
    snapshot: EMPTY_SESSION_SNAPSHOT,
  })
  publishSessionEvent(SESSION_SYNC_EVENT.signedOut)
}

/** 注销服务端 Session，并保证本地与其他标签页都清除敏感状态。 */
export async function logoutSession(): Promise<void> {
  sessionEpoch += 1
  try {
    if (sessionState.snapshot.session) await signOut()
  } finally {
    updateSessionState({
      status: "anonymous",
      snapshot: EMPTY_SESSION_SNAPSHOT,
    })
    publishSessionEvent(SESSION_SYNC_EVENT.signedOut)
  }
}

/** 挂载页面可见性同步，返回对应清理函数。 */
export function startSessionSynchronization(): () => void {
  if (typeof document === "undefined") return () => undefined
  document.addEventListener("visibilitychange", handleVisibilityChange)
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange)
  }
}

sessionChannel?.addEventListener("message", handleSessionChannelMessage)

/** API 层使用的唯一认证提供者注销函数，仅供热更新清理。 */
const unregisterRequestAuthenticationProvider =
  registerRequestAuthenticationProvider({
    readIdentity: readRequestAuthenticationIdentity,
    refreshAccessToken: refreshAccessTokenOnce,
    expireSession,
  })

/** 热更新时移除认证提供者并关闭旧跨标签页通道。 */
function disposeSessionRuntime(): void {
  unregisterRequestAuthenticationProvider()
  sessionChannel?.close()
}

if (import.meta.hot) {
  import.meta.hot.dispose(disposeSessionRuntime)
}
