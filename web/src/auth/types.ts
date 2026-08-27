/**
 * 登录与注册共用的认证表单数据。
 *
 * @remarks
 * 角色与权限由用户管理模块和后端会话负责，不由公开认证表单提交。
 *
 * @public
 * @since 1.0.0
 */
export interface AuthFormValues {
  /** 用户名。 */
  username: string

  /** 邮箱地址。 */
  email: string

  /** 用户密码。 */
  password: string
}

/**
 * 忘记密码表单数据。
 *
 * @public
 * @since 1.0.0
 */
export type ForgotPasswordFormValues = Pick<AuthFormValues, "email">

/**
 * 重置密码表单数据。
 *
 * @remarks
 * 确认密码只用于页面内一致性校验，不提交给后端。
 *
 * @public
 * @since 1.0.0
 */
export type ResetPasswordFormValues = Pick<AuthFormValues, "password">

/**
 * 第三方认证服务标识。
 *
 * @public
 * @since 1.0.0
 */
export type AuthProvider = "google" | "apple" | "meta"
