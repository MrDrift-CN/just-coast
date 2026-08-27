import { useCallback, useState } from "react"

import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/auth/types"

const previewResetToken = "static-preview"

/**
 * 请求发送密码重置邮件。
 *
 * @param email - 接收密码重置邮件的邮箱地址。
 * @returns 邮件服务完成后的 Promise。
 *
 * @remarks
 * 当前项目尚未接入邮件 API，因此该函数直接成功返回。接入后只需替换函数内部实现，
 * 页面与流程状态无需调整。
 *
 * @internal
 * @since 1.0.0
 */
function requestPasswordResetEmail(email: string): Promise<void> {
  void email
  return Promise.resolve()
}

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

  const requestReset = useCallback(
    async ({ email }: ForgotPasswordFormValues) => {
      setPending(true)

      try {
        await requestPasswordResetEmail(email)
        return previewResetToken
      } finally {
        setPending(false)
      }
    },
    []
  )

  const resetPassword = useCallback(
    async (values: ResetPasswordFormValues, currentResetToken: string) => {
      void values
      void currentResetToken
    },
    []
  )

  return {
    pending,
    requestReset,
    resetPassword,
  }
}
