import { useTranslation } from "react-i18next"

import { LoginForm } from "@/auth/components/login-form"
import { AuthShell } from "@/auth/components/auth-shell"
import { useLogin } from "@/auth/hooks/use-login"
import type {
  AuthFormAction,
  AuthProvider,
  LoginFormValues,
} from "@/auth/types"
import { Button } from "@/components/ui/button"
import { I18nButton } from "@/i18n/i18n-button"

/**
 * 登录页面属性。
 *
 * @public
 * @since 1.0.0
 */
export interface LoginProps {
  /** 由外部认证流程控制的提交状态。 */
  pending?: boolean

  /** 提交完成浏览器原生校验后的登录数据。 */
  onSubmit?: AuthFormAction<LoginFormValues>

  /** 选择第三方认证服务商时执行的回调。 */
  onSocialLogin?: (provider: AuthProvider) => void

  /** 进入忘记密码场景时执行的回调。 */
  onForgotPassword?: () => void

  /** 进入注册场景时执行的回调。 */
  onRegister?: () => void
}

/**
 * 用户登录页面。
 *
 * @param props - 登录页面属性。
 * @returns 登录页面。
 *
 * @remarks
 * 页面只组装登录外壳、表单和场景导航。角色与权限不在登录阶段分配。
 * 未传入提交处理器时，表单不会发送请求或模拟登录结果。
 *
 * @public
 * @since 1.0.0
 */
export function Login({
  pending = false,
  onSubmit,
  onSocialLogin,
  onForgotPassword,
  onRegister,
}: LoginProps) {
  const { t } = useTranslation("auth")
  const { login, pending: submitting } = useLogin(onSubmit)
  const isPending = pending || submitting

  return (
    <AuthShell
      actions={<I18nButton />}
      title={t("login.title")}
      description={t("login.description")}
      footer={
        <div className="flex flex-col items-center gap-1 sm:flex-row">
          <Button
            disabled={isPending}
            type="button"
            variant="link"
            onClick={onForgotPassword}
          >
            {t("login.actions.forgotPassword")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("login.actions.noAccount")}
          </span>
          <Button
            disabled={isPending}
            type="button"
            variant="link"
            onClick={onRegister}
          >
            {t("login.actions.register")}
          </Button>
        </div>
      }
    >
      <LoginForm
        pending={isPending}
        onSocialLogin={onSocialLogin}
        onSubmit={login}
      />
    </AuthShell>
  )
}
