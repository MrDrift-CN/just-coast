import { useTranslation } from "react-i18next"

import { AuthShell } from "@/auth/components/AuthShell"
import { LoginForm, type LoginFormValues } from "@/auth/components/LoginForm"
import { useAuthAction } from "@/auth/hooks/useAuthAction"
import type { AuthFormAction, SocialAuthProvider } from "@/auth/types"
import { Button } from "@/components/ui/button"
import { LanguageButton } from "@/i18n"

/** 登录页面的认证动作与场景导航属性。 */
export interface LoginProps {
  /** 登录表单完成浏览器校验后触发。 */
  onSubmit?: AuthFormAction<LoginFormValues>

  /** 用户选择第三方登录提供方时触发。 */
  onSocialLogin?: (provider: SocialAuthProvider) => void

  /** 用户进入密码重置场景时触发。 */
  onForgotPassword?: () => void

  /** 用户进入注册场景时触发。 */
  onRegister?: () => void
}

/** 只组装登录界面与场景导航；认证副作用由调用方注入。 */
export function Login({
  onSubmit,
  onSocialLogin,
  onForgotPassword,
  onRegister,
}: LoginProps) {
  const { t } = useTranslation("auth")
  const { execute: login, pending } = useAuthAction(onSubmit)

  return (
    <AuthShell
      actions={<LanguageButton />}
      title={t("login.title")}
      description={t("login.description")}
      footer={
        <div className="flex flex-col items-center gap-1 sm:flex-row">
          <Button
            disabled={pending}
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
            disabled={pending}
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
        pending={pending}
        onSocialLogin={onSocialLogin}
        onSubmit={login}
      />
    </AuthShell>
  )
}
