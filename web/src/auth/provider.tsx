import { type ReactNode, useEffect, useMemo, useSyncExternalStore } from "react"

import {
  establishSession,
  getSessionState,
  initializeSession,
  logoutSession,
  refreshSession,
  startSessionSynchronization,
  subscribeSession,
} from "@/auth/session"
import {
  SessionContext,
  type SessionControllerContextValue,
} from "@/auth/hooks/useSession.ts"

/** Session React Provider 覆盖的子树属性。 */
export interface SessionProviderProps {
  /** 需要共享认证状态的应用子树。 */
  readonly children: ReactNode
}

/**
 * 将框架无关的 Session 运行时接入 React Context。
 *
 * @example
 * ```tsx
 * <SessionProvider>
 *   <App />
 * </SessionProvider>
 * ```
 */
export const SessionProvider = ({ children }: SessionProviderProps) => {
  const state = useSyncExternalStore(
    subscribeSession,
    getSessionState,
    getSessionState
  )

  useEffect(
    /** 首次挂载时恢复 Session，并在页面重新可见时校准状态。 */
    function synchronizeSessionLifecycle() {
      const stopSynchronization = startSessionSynchronization()
      void initializeSession()
      return stopSynchronization
    },
    []
  )

  const value = useMemo<SessionControllerContextValue>(
    () => ({
      status: state.status,
      session: state.snapshot.session,
      establish: establishSession,
      refresh: refreshSession,
      logout: logoutSession,
    }),
    [state.snapshot.session, state.status]
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
