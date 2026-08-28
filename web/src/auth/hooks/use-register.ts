import { useAuthAction } from "@/auth/hooks/use-auth-action"
import type { AuthFormAction, RegisterFormValues } from "@/auth/types"

/**
 * 注册提交状态。
 *
 * @param action - 注册业务操作；未提供时保持静态预览行为。
 * @returns 注册操作与提交状态。
 * @public
 * @since 1.0.0
 */
export function useRegister(action?: AuthFormAction<RegisterFormValues>) {
  const { execute, pending } = useAuthAction(action)

  return { pending, register: execute }
}
