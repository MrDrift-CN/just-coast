import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/auth/types"

const previewResetToken = "static-preview"

/**
 * 请求发送密码重置邮件。
 *
 * @param values - 接收密码重置邮件的邮箱地址。
 * @returns 当前静态流程使用的密码重置令牌。
 *
 * @remarks
 * 当前项目尚未接入邮件 API，因此该函数直接成功返回。接入后只替换该接口边界，
 * 页面与 Hook 无需了解具体请求协议。
 *
 * @public
 * @since 1.0.0
 */
export function requestPasswordResetEmail(
  values: ForgotPasswordFormValues
): Promise<string> {
  void values
  return Promise.resolve(previewResetToken)
}

/**
 * 提交新的账户密码。
 *
 * @param values - 新密码。
 * @param resetToken - 后端签发的密码重置令牌。
 * @returns 密码更新完成后的 Promise。
 *
 * @remarks
 * 当前项目尚未接入认证后端，因此该接口边界直接成功返回。
 *
 * @public
 * @since 1.0.0
 */
export function updatePassword(
  values: ResetPasswordFormValues,
  resetToken: string
): Promise<void> {
  void values
  void resetToken
  return Promise.resolve()
}
