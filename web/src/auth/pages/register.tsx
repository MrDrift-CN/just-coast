import { useTranslation } from "react-i18next"

import { AuthShell } from "@/auth/components/auth-shell"
import { RegisterForm } from "@/auth/components/register-form"
import { useRegister } from "@/auth/hooks/use-register"
import type {
  AuthFormAction,
  AuthProvider,
  RegisterFormValues,
} from "@/auth/types"
import { Button } from "@/components/ui/button"
import { I18nButton } from "@/i18n/i18n-button"

/**
 * 注册页面属性。
 *
 * @public
 * @since 1.0.0
 */
export interface RegisterProps {
  /** 由外部认证流程控制的提交状态。 */
  pending?: boolean

  /** 提交完成浏览器原生校验后的注册数据。 */
  onSubmit?: AuthFormAction<RegisterFormValues>

  /** 选择第三方认证服务商时执行的回调。 */
  onSocialLogin?: (provider: AuthProvider) => void

  /** 返回登录场景时执行的回调。 */
  onLogin?: () => void
}

/**
 * 用户注册页面。
 *
 * @param props - 注册页面属性。
 * @returns 注册页面。
 *
 * @remarks
 * 页面只组装注册外壳、表单和场景导航。角色与权限由用户管理模块和后端负责。
 * 未传入提交处理器时，表单不会发送请求或模拟注册结果。
 *
 * @public
 * @since 1.0.0
 */
export function Register({
  pending = false,
  onSubmit,
  onSocialLogin,
  onLogin,
}: RegisterProps) {
  const { t } = useTranslation("auth")
  const { pending: submitting, register } = useRegister(onSubmit)
  const isPending = pending || submitting

  return (
    <AuthShell
      actions={<I18nButton />}
      title={t("register.title")}
      description={t("register.description")}
      footer={
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">
            {t("register.actions.hasAccount")}
          </span>
          <Button
            disabled={isPending}
            type="button"
            variant="link"
            onClick={onLogin}
          >
            {t("register.actions.login")}
          </Button>
        </div>
      }
    >
      <RegisterForm
        pending={isPending}
        onSocialLogin={onSocialLogin}
        onSubmit={register}
      />
    </AuthShell>
  )
}
