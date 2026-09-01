import { useTranslation } from "react-i18next"

import type { AlternativeLoginAction } from "@/auth/components/alternative-login-methods"
import { AuthShell } from "@/auth/components/auth-shell"
import {
  FormRegister,
  type FormRegisterValues,
} from "@/auth/components/form-register"
import { useAuthAction } from "@/auth/hooks/useAuthAction"
import type { AuthFormAction, VerificationCodeResult } from "@/auth/types"
import { Button } from "@/components/ui/button"
import { LanguageButton } from "@/i18n"

/** 注册页面的认证动作与场景导航属性。 */
export interface RegisterProps {
  /** 注册表单完成浏览器校验后触发。 */
  onSubmit: AuthFormAction<FormRegisterValues>

  /** 请求向注册邮箱发送一次性验证码。 */
  onRequestVerificationCode: AuthFormAction<string, VerificationCodeResult>

  /** 用户选择项目自有扫码登录时触发。 */
  onQrCodeLogin?: AlternativeLoginAction

  /** 用户选择 GitHub OAuth 登录时触发。 */
  onGithubLogin?: AlternativeLoginAction

  /** 用户返回登录场景时触发。 */
  onLogin: () => void
}

/** 组装注册界面与场景导航；认证副作用由调用方注入。 */
export const Register = ({
  onSubmit,
  onRequestVerificationCode,
  onQrCodeLogin,
  onGithubLogin,
  onLogin,
}: RegisterProps) => {
  const { t } = useTranslation("auth")
  const { execute: register, pending } = useAuthAction(onSubmit, {
    success: t("register.feedback.success"),
    error: t("register.errors.failed"),
  })

  return (
    <AuthShell
      actions={<LanguageButton />}
      description={t("register.description")}
      footer={
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">
            {t("register.actions.hasAccount")}
          </span>
          <Button
            disabled={pending}
            onClick={onLogin}
            type="button"
            variant="link"
          >
            {t("register.actions.login")}
          </Button>
        </div>
      }
      title={t("register.title")}
    >
      <FormRegister
        onGithubLogin={onGithubLogin}
        onQrCodeLogin={onQrCodeLogin}
        onRequestVerificationCode={onRequestVerificationCode}
        onSubmit={register}
        pending={pending}
      />
    </AuthShell>
  )
}
