import { ArrowLeftIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { AlternativeLoginAction } from "@/auth/components/alternative-login-methods"
import { AuthShell } from "@/auth/components/auth-shell"
import {
  FormForgotPassword,
  type FormForgotPasswordValues,
} from "@/auth/components/form-forgot-password"
import { FormLogin, type FormLoginValues } from "@/auth/components/form-login"
import {
  FormResetPassword,
  type FormResetPasswordValues,
} from "@/auth/components/form-reset-password"
import { useAuthAction } from "@/auth/hooks/useAuthAction"
import type { AuthFormAction, VerificationCodeResult } from "@/auth/types"
import { Button } from "@/components/ui/button"
import { LanguageButton } from "@/i18n"

/** 登录页面可以承载的认证场景。 */
export type LoginScene =
  /** 账号登录场景。 */
  | "login"
  /** 邮箱验证码校验场景。 */
  | "forgotPassword"
  /** 设置新密码场景。 */
  | "resetPassword"

/** 登录页面的认证场景、动作与导航属性。 */
export interface LoginProps {
  /** 当前展示的登录相关场景。 */
  scene?: LoginScene

  /** 登录表单完成浏览器校验后触发。 */
  onSubmit: AuthFormAction<FormLoginValues>

  /** 请求向当前表单邮箱发送一次性验证码。 */
  onRequestVerificationCode: AuthFormAction<string, VerificationCodeResult>

  /** 邮箱和验证码完成浏览器校验后触发。 */
  onRequestReset: AuthFormAction<FormForgotPasswordValues>

  /** 新密码通过一致性校验后触发。 */
  onResetPassword: AuthFormAction<FormResetPasswordValues>

  /** 用户选择项目自有扫码登录时触发。 */
  onQrCodeLogin?: AlternativeLoginAction

  /** 用户选择 GitHub OAuth 登录时触发。 */
  onGithubLogin?: AlternativeLoginAction

  /** 用户进入密码重置场景时触发。 */
  onForgotPassword: () => void

  /** 用户返回账号登录场景时触发。 */
  onLogin: () => void

  /** 用户进入注册场景时触发。 */
  onRegister: () => void
}

/** 组装登录、找回密码和设置新密码场景。 */
export const Login = ({
  scene = "login",
  onSubmit,
  onRequestVerificationCode,
  onRequestReset,
  onResetPassword,
  onQrCodeLogin,
  onGithubLogin,
  onForgotPassword,
  onLogin,
  onRegister,
}: LoginProps) => {
  const { t } = useTranslation("auth")
  const loginAction = useAuthAction(onSubmit, {
    success: t("login.feedback.success"),
    error: t("login.errors.failed"),
  })
  const requestResetAction = useAuthAction(onRequestReset, {
    success: t("forgotPassword.feedback.success"),
    error: t("forgotPassword.errors.verificationFailed"),
  })
  const resetPasswordAction = useAuthAction(onResetPassword, {
    success: t("resetPassword.feedback.success"),
    error: t("resetPassword.errors.failed"),
  })
  const isLoginScene = scene === "login"
  const isResetStage = scene === "resetPassword"
  const title = t(`${scene}.title`)
  const description = t(`${scene}.description`)
  let pending = requestResetAction.pending

  if (isLoginScene) {
    pending = loginAction.pending
  } else if (isResetStage) {
    pending = resetPasswordAction.pending
  }
  let form = (
    <FormForgotPassword
      onRequestVerificationCode={onRequestVerificationCode}
      onSubmit={requestResetAction.execute}
      pending={pending}
      title={title}
    />
  )

  if (isLoginScene) {
    form = (
      <FormLogin
        onGithubLogin={onGithubLogin}
        onQrCodeLogin={onQrCodeLogin}
        onRequestVerificationCode={onRequestVerificationCode}
        onSubmit={loginAction.execute}
        pending={pending}
      />
    )
  } else if (isResetStage) {
    form = (
      <FormResetPassword
        onSubmit={resetPasswordAction.execute}
        pending={pending}
        title={title}
      />
    )
  }

  const footer = isLoginScene ? (
    <div className="flex flex-col items-center gap-1 sm:flex-row">
      <Button
        disabled={pending}
        onClick={onForgotPassword}
        type="button"
        variant="link"
      >
        {t("login.actions.forgotPassword")}
      </Button>
      <span className="text-sm text-muted-foreground">
        {t("login.actions.noAccount")}
      </span>
      <Button
        disabled={pending}
        onClick={onRegister}
        type="button"
        variant="link"
      >
        {t("login.actions.register")}
      </Button>
    </div>
  ) : (
    <Button disabled={pending} onClick={onLogin} type="button" variant="link">
      <ArrowLeftIcon aria-hidden="true" />
      {t(`${scene}.actions.login`)}
    </Button>
  )

  return (
    <AuthShell
      actions={<LanguageButton />}
      description={description}
      footer={footer}
      title={title}
    >
      {form}
    </AuthShell>
  )
}
