import { useTranslation } from "react-i18next"

import { AuthShell } from "@/auth/components/AuthShell"
import {
  RegisterForm,
  type RegisterFormValues,
} from "@/auth/components/RegisterForm"
import { useAuthAction } from "@/auth/hooks/useAuthAction"
import type { AuthFormAction, SocialAuthProvider } from "@/auth/types"
import { Button } from "@/components/ui/button"
import { LanguageButton } from "@/i18n"

/** 注册页面的认证动作与场景导航属性。 */
export interface RegisterProps {
  /** 注册表单完成浏览器校验后触发。 */
  onSubmit?: AuthFormAction<RegisterFormValues>

  /** 用户选择第三方注册提供方时触发。 */
  onSocialLogin?: (provider: SocialAuthProvider) => void

  /** 用户返回登录场景时触发。 */
  onLogin?: () => void
}

/** 只组装注册界面与场景导航；认证副作用由调用方注入。 */
export function Register({ onSubmit, onSocialLogin, onLogin }: RegisterProps) {
  const { t } = useTranslation("auth")
  const { execute: register, pending } = useAuthAction(onSubmit)

  return (
    <AuthShell
      actions={<LanguageButton />}
      title={t("register.title")}
      description={t("register.description")}
      footer={
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">
            {t("register.actions.hasAccount")}
          </span>
          <Button
            disabled={pending}
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
        pending={pending}
        onSocialLogin={onSocialLogin}
        onSubmit={register}
      />
    </AuthShell>
  )
}
