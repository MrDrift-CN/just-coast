import { useState, type SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import { PasswordField } from "@/auth/components/PasswordField"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

/** 密码重置表单两个阶段共用的内容与动作边界。 */
export interface ForgotPasswordFormProps {
  /** 当前阶段用于表单可访问名称的标题。 */
  title: string

  /** 是否展示设置新密码阶段；否则展示申请重置说明阶段。 */
  isResetStage?: boolean

  /** 申请重置阶段完成浏览器校验后触发。 */
  onRequestReset?: () => void

  /** 设置新密码阶段通过一致性校验后触发。 */
  onResetPassword?: () => void
}

/** 根据预览阶段切换申请重置和设置新密码表单。 */
export function ForgotPasswordForm({
  title,
  isResetStage = false,
  onRequestReset,
  onResetPassword,
}: ForgotPasswordFormProps) {
  const { t } = useTranslation("auth")
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const submitLabel = isResetStage
    ? t("resetPassword.actions.submit")
    : t("forgotPassword.actions.submit")

  /** 根据当前阶段解析字段、校验密码一致性并触发对应动作。 */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isResetStage) {
      onRequestReset?.()
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const passwordEntry = formData.get("password")
    const confirmationEntry = formData.get("confirmPassword")
    const password = typeof passwordEntry === "string" ? passwordEntry : ""
    const confirmation =
      typeof confirmationEntry === "string" ? confirmationEntry : ""

    if (password !== confirmation) {
      setPasswordMismatch(true)
      const confirmationInput = form.elements.namedItem("confirmPassword")

      if (confirmationInput instanceof HTMLInputElement) {
        confirmationInput.focus()
      }

      return
    }

    setPasswordMismatch(false)
    onResetPassword?.()
  }

  return (
    <form aria-label={title} onSubmit={handleSubmit}>
      <FieldGroup>
        {isResetStage ? (
          <>
            <PasswordField
              autoComplete="new-password"
              id="reset-password"
              label={t("fields.password.newLabel")}
              name="password"
              placeholder={t("fields.password.newPlaceholder")}
              required
            />

            <PasswordField
              autoComplete="new-password"
              error={
                passwordMismatch ? t("validation.passwordMismatch") : undefined
              }
              id="reset-password-confirmation"
              label={t("fields.password.confirmLabel")}
              name="confirmPassword"
              onChange={() => setPasswordMismatch(false)}
              placeholder={t("fields.password.confirmPlaceholder")}
              required
            />
          </>
        ) : (
          <Field>
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
              id="forgot-password-email"
              name="email"
              placeholder={t("fields.email.placeholder")}
              required
              type="email"
            />
          </Field>
        )}

        <Field>
          <Button className="auth-submit-button w-full" size="lg" type="submit">
            {submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
