import { useCallback, useState } from "react"

import { requestPasswordResetEmail, updatePassword } from "@/auth/api"
import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/auth/types"

/**
 * 忘记密码静态流程。
 *
 * @returns 忘记密码页面所需的阶段状态与操作。
 *
 * @remarks
 * 邮件请求成功后进入静态的新密码阶段；接入真实邮件服务与路由后，
 * 应由邮件链接中的后端令牌初始化该阶段。
 *
 * @public
 * @since 1.0.0
 */
export function useForgetPassword() {
  const [pending, setPending] = useState(false)

  const requestReset = useCallback(async (values: ForgotPasswordFormValues) => {
    setPending(true)

    try {
      return await requestPasswordResetEmail(values)
    } finally {
      setPending(false)
    }
  }, [])

  const resetPassword = useCallback(
    async (values: ResetPasswordFormValues, currentResetToken: string) => {
      setPending(true)

      try {
        await updatePassword(values, currentResetToken)
      } finally {
        setPending(false)
      }
    },
    []
  )

  return {
    pending,
    requestReset,
    resetPassword,
  }
}
