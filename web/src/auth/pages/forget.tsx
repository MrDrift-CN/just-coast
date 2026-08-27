import { useState, type FormEvent } from "react"
import { ArrowLeftIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { I18nButton } from "@/i18n/i18n-button"

import { AuthShell } from "@/auth/components/auth-shell"
import { PasswordField } from "@/auth/components/password-field"
import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/auth/types"

/**
 * 忘记密码页面属性。
 *
 * @public
 * @since 1.0.0
 */
export interface ForgotPasswordProps {
  /** 表单是否正在提交。 */
  pending?: boolean

  /** 后端签发的密码重置令牌；存在时页面进入设置新密码阶段。 */
  resetToken?: string

  /** 提交完成浏览器原生校验后的邮箱地址。 */
  onRequestReset?: (values: ForgotPasswordFormValues) => void | Promise<void>

  /** 提交完成页面校验后的新密码和对应的重置令牌。 */
  onResetPassword?: (
    values: ResetPasswordFormValues,
    resetToken: string
  ) => void | Promise<void>

  /** 返回登录场景时执行的回调。 */
  onLogin?: () => void
}

/**
 * 忘记密码页面。
 *
 * @param props - 忘记密码页面属性。
 * @returns 忘记密码页面。
 *
 * @remarks
 * 没有重置令牌时收集邮箱并发起重置请求；存在重置令牌时收集并校验新密码。
 * 令牌的读取与校验由路由和后端集成层负责，页面不会模拟邮件发送成功或自动切换阶段。
 *
 * @public
 * @since 1.0.0
 */
export function ForgotPassword({
  pending = false,
  resetToken,
  onRequestReset,
  onResetPassword,
  onLogin,
}: ForgotPasswordProps) {
  const { t } = useTranslation("auth")
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const isResetStage = Boolean(resetToken)
  const title = isResetStage
    ? t("resetPassword.title")
    : t("forgotPassword.title")
  const description = isResetStage
    ? t("resetPassword.description")
    : t("forgotPassword.description")
  const submittingLabel = isResetStage
    ? t("resetPassword.actions.submitting")
    : t("forgotPassword.actions.submitting")
  const submitLabel = isResetStage
    ? t("resetPassword.actions.submit")
    : t("forgotPassword.actions.submit")
  const loginLabel = isResetStage
    ? t("resetPassword.actions.login")
    : t("forgotPassword.actions.login")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    if (!isResetStage) {
      if (!onRequestReset) {
        return
      }

      void onRequestReset({
        email: String(formData.get("email") ?? ""),
      })
      return
    }

    const password = String(formData.get("password") ?? "")
    const confirmation = String(formData.get("confirmPassword") ?? "")

    if (password !== confirmation) {
      setPasswordMismatch(true)
      const confirmationInput = form.elements.namedItem("confirmPassword")

      if (confirmationInput instanceof HTMLInputElement) {
        confirmationInput.focus()
      }

      return
    }

    setPasswordMismatch(false)

    if (!onResetPassword || !resetToken) {
      return
    }

    void onResetPassword({ password }, resetToken)
  }

  return (
    <AuthShell
      actions={<I18nButton />}
      title={title}
      description={description}
      footer={
        <Button
          disabled={pending}
          type="button"
          variant="link"
          onClick={onLogin}
        >
          <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
          {loginLabel}
        </Button>
      }
    >
      <form aria-busy={pending} aria-label={title} onSubmit={handleSubmit}>
        <FieldGroup>
          {isResetStage ? (
            <>
              <PasswordField
                autoComplete="new-password"
                disabled={pending}
                id="reset-password"
                label={t("fields.password.newLabel")}
                minLength={8}
                name="password"
                placeholder={t("fields.password.newPlaceholder")}
                required
              />

              <PasswordField
                autoComplete="new-password"
                disabled={pending}
                error={
                  passwordMismatch
                    ? t("validation.passwordMismatch")
                    : undefined
                }
                id="reset-password-confirmation"
                label={t("fields.password.confirmLabel")}
                minLength={8}
                name="confirmPassword"
                onChange={() => setPasswordMismatch(false)}
                placeholder={t("fields.password.confirmPlaceholder")}
                required
              />
            </>
          ) : (
            <Field data-disabled={pending || undefined}>
              <FieldLabel htmlFor="forgot-password-email">
                {t("fields.email.label")}
              </FieldLabel>
              <Input
                className="auth-input"
                autoComplete="email"
                disabled={pending}
                id="forgot-password-email"
                name="email"
                placeholder={t("fields.email.placeholder")}
                required
                type="email"
              />
            </Field>
          )}

          <Field data-disabled={pending || undefined}>
            <Button
              className="auth-submit-button w-full"
              disabled={pending}
              size="lg"
              type="submit"
            >
              {pending ? (
                <Spinner
                  aria-label={submittingLabel}
                  data-icon="inline-start"
                />
              ) : null}
              {pending ? submittingLabel : submitLabel}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthShell>
  )
}
