import { useState, type SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import { PasswordField } from "@/auth/components/password-field"
import {
  parseForgotPasswordFormData,
  parseResetPasswordFormData,
  passwordMinLength,
} from "@/auth/schema"
import type {
  AuthFormAction,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/auth/types"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

/**
 * 忘记密码表单属性。
 *
 * @public
 * @since 1.0.0
 */
export interface ForgetFormProps {
  /** 表单的可访问名称。 */
  title: string

  /** 表单是否正在提交。 */
  pending?: boolean

  /** 后端签发的密码重置令牌；存在时表单进入设置新密码阶段。 */
  resetToken?: string

  /** 提交完成浏览器原生校验后的邮箱地址。 */
  onRequestReset?: AuthFormAction<ForgotPasswordFormValues>

  /** 提交完成页面校验后的新密码和对应的重置令牌。 */
  onResetPassword?: (
    values: ResetPasswordFormValues,
    resetToken: string
  ) => void | Promise<void>
}

/**
 * 渲染密码重置请求或设置新密码表单。
 *
 * @param props - 忘记密码表单属性。
 * @returns 当前重置阶段对应的表单。
 * @public
 * @since 1.0.0
 */
export function ForgetForm({
  title,
  pending = false,
  resetToken,
  onRequestReset,
  onResetPassword,
}: ForgetFormProps) {
  const { t } = useTranslation("auth")
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const isResetStage = Boolean(resetToken)
  const submittingLabel = isResetStage
    ? t("resetPassword.actions.submitting")
    : t("forgotPassword.actions.submitting")
  const submitLabel = isResetStage
    ? t("resetPassword.actions.submit")
    : t("forgotPassword.actions.submit")

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    if (!isResetStage) {
      void onRequestReset?.(parseForgotPasswordFormData(formData))
      return
    }

    const { values, confirmation } = parseResetPasswordFormData(formData)

    if (values.password !== confirmation) {
      setPasswordMismatch(true)
      const confirmationInput = form.elements.namedItem("confirmPassword")

      if (confirmationInput instanceof HTMLInputElement) {
        confirmationInput.focus()
      }

      return
    }

    setPasswordMismatch(false)

    if (resetToken) {
      void onResetPassword?.(values, resetToken)
    }
  }

  return (
    <form aria-busy={pending} aria-label={title} onSubmit={handleSubmit}>
      <FieldGroup>
        {isResetStage ? (
          <>
            <PasswordField
              autoComplete="new-password"
              disabled={pending}
              id="reset-password"
              label={t("fields.password.newLabel")}
              minLength={passwordMinLength}
              name="password"
              placeholder={t("fields.password.newPlaceholder")}
              required
            />

            <PasswordField
              autoComplete="new-password"
              disabled={pending}
              error={
                passwordMismatch ? t("validation.passwordMismatch") : undefined
              }
              id="reset-password-confirmation"
              label={t("fields.password.confirmLabel")}
              minLength={passwordMinLength}
              name="confirmPassword"
              onChange={() => setPasswordMismatch(false)}
              placeholder={t("fields.password.confirmPlaceholder")}
              required
            />
          </>
        ) : (
          <Field data-disabled={pending || undefined}>
            <FieldLabel
              htmlFor="forgot-password-email"
              id="forgot-password-email-label"
            >
              {t("fields.email.label")}
            </FieldLabel>
            <Input
              className="auth-input"
              aria-labelledby="forgot-password-email-label"
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
              <Spinner aria-label={submittingLabel} data-icon="inline-start" />
            ) : null}
            {pending ? submittingLabel : submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
