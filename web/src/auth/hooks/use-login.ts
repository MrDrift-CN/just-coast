import { useAuthAction } from "@/auth/hooks/use-auth-action"
import type { AuthFormAction, LoginFormValues } from "@/auth/types"

/**
 * 登录提交状态。
 *
 * @param action - 登录业务操作；未提供时保持静态预览行为。
 * @returns 登录操作与提交状态。
 * @public
 * @since 1.0.0
 */
export function useLogin(action?: AuthFormAction<LoginFormValues>) {
  const { execute, pending } = useAuthAction(action)

  return { login: execute, pending }
}
