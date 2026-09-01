import { createContext, useContext } from "react"

import type { SessionStatus } from "@/auth/session.ts"
import type { AuthenticationResult, AuthSession } from "@/auth/types.ts"

/** 页面与其他 React 消费者共享的安全认证状态和动作。 */
export interface SessionContextValue {
  /** 当前认证生命周期状态。 */
  readonly status: SessionStatus
  /** 当前服务端 Session 的非敏感摘要。 */
  readonly session: AuthSession | null
  /** 从 HttpOnly Cookie Session 重新恢复状态。 */
  readonly refresh: () => Promise<void>
  /** 注销服务端 Session 并清理所有标签页的敏感状态。 */
  readonly logout: () => Promise<void>
}

/** 只供 Auth 路由使用、能够接收认证结果的内部控制器。 */
export interface SessionControllerContextValue extends SessionContextValue {
  /** 登录、GitHub 或扫码完成后接收完整认证结果。 */
  readonly establish: (result: AuthenticationResult) => void
}

/** 未挂载 Provider 时用于检测错误用法的空上下文。 */
export const SessionContext =
  createContext<SessionControllerContextValue | null>(null)

/** 读取 Provider 中的完整内部上下文并检查挂载边界。 */
function useSessionContextValue(): SessionControllerContextValue {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error("useSession must be used within SessionProvider")
  }
  return value
}

/**
 * 读取当前应用共享的认证状态和动作。
 *
 * @example
 * ```tsx
 * const { status, session, logout } = useSession()
 * if (status !== "authenticated") return null
 * return <button onClick={() => void logout()}>{session?.user.username}</button>
 * ```
 */
export function useSession(): SessionContextValue {
  const { status, session, refresh, logout } = useSessionContextValue()
  return { status, session, refresh, logout }
}

/** 只供 Auth 路由接收认证结果和读取完整 Session 控制能力。 */
export function useSessionController(): SessionControllerContextValue {
  return useSessionContextValue()
}
