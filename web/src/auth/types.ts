/**
 * 认证凭据表单数据。
 *
 * @remarks
 * 登录与注册当前收集相同字段，但通过各自的语义类型保持业务边界。
 * 角色与权限由用户管理模块和后端会话负责，不由公开认证表单提交。
 *
 * @public
 * @since 1.0.0
 */
export interface CredentialsFormValues {
  /** 用户名。 */
  username: string

  /** 邮箱地址。 */
  email: string

  /** 用户密码。 */
  password: string
}

/**
 * 登录表单数据。
 *
 * @public
 * @since 1.0.0
 */
export type LoginFormValues = CredentialsFormValues

/**
 * 注册表单数据。
 *
 * @public
 * @since 1.0.0
 */
export type RegisterFormValues = CredentialsFormValues

/**
 * 忘记密码表单数据。
 *
 * @public
 * @since 1.0.0
 */
export type ForgotPasswordFormValues = Pick<CredentialsFormValues, "email">

/**
 * 重置密码表单数据。
 *
 * @remarks
 * 确认密码只用于页面内一致性校验，不提交给后端。
 *
 * @public
 * @since 1.0.0
 */
export type ResetPasswordFormValues = Pick<CredentialsFormValues, "password">

/**
 * 认证表单异步操作。
 *
 * @template TValues - 当前认证场景提交的数据类型。
 * @param values - 完成浏览器原生校验后的表单数据。
 * @returns 操作完成后的结果。
 * @public
 * @since 1.0.0
 */
export type AuthFormAction<TValues> = (values: TValues) => void | Promise<void>

/**
 * 第三方认证服务标识。
 *
 * @public
 * @since 1.0.0
 */
export type AuthProvider = "google" | "apple" | "meta"
