import type {
  CredentialsFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/auth/types"

/**
 * 密码最小长度。
 *
 * @remarks
 * 登录、注册和密码重置表单统一消费该约束，避免页面间产生不一致。
 *
 * @readonly
 * @public
 * @since 1.0.0
 */
export const passwordMinLength = 8

/**
 * 从表单数据中读取字符串字段。
 *
 * @param formData - 浏览器表单数据。
 * @param name - 字段名称。
 * @returns 字段的字符串值；字段不存在时返回空字符串。
 * @internal
 * @since 1.0.0
 */
function readString(formData: FormData, name: string): string {
  const value = formData.get(name)

  return typeof value === "string" ? value : ""
}

/**
 * 解析登录或注册使用的认证凭据。
 *
 * @param formData - 完成浏览器原生校验后的表单数据。
 * @returns 用户名、邮箱和密码。
 * @public
 * @since 1.0.0
 */
export function parseCredentialsFormData(
  formData: FormData
): CredentialsFormValues {
  return {
    username: readString(formData, "username"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
  }
}

/**
 * 解析忘记密码请求数据。
 *
 * @param formData - 完成浏览器原生校验后的表单数据。
 * @returns 邮箱地址。
 * @public
 * @since 1.0.0
 */
export function parseForgotPasswordFormData(
  formData: FormData
): ForgotPasswordFormValues {
  return { email: readString(formData, "email") }
}

/**
 * 解析重置密码数据。
 *
 * @param formData - 完成浏览器原生校验后的表单数据。
 * @returns 新密码和用于页面一致性校验的确认密码。
 * @public
 * @since 1.0.0
 */
export function parseResetPasswordFormData(formData: FormData): {
  values: ResetPasswordFormValues
  confirmation: string
} {
  return {
    values: { password: readString(formData, "password") },
    confirmation: readString(formData, "confirmPassword"),
  }
}
