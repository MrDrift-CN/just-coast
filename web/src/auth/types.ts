/** 可由认证表单调用的同步或异步提交动作。 */
export type AuthFormAction<TValues> = (values: TValues) => void | Promise<void>

/** 登录与注册界面支持的第三方认证提供方。 */
export type SocialAuthProvider =
  /** Google 账号认证。 */
  | "google"
  /** Apple 账号认证。 */
  | "apple"
  /** Meta 账号认证。 */
  | "meta"
