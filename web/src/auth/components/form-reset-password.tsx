import { useState, type SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import { FieldPassword } from "@/auth/components/field-password"
import type { AuthFormAction } from "@/auth/types"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

/** 设置新密码阶段完成浏览器校验后提交的字段。 */
export interface FormResetPasswordValues {
  /** 尚未提交到服务端的新密码，不得记录或持久化。 */
  newPassword: string

  /** 只在当前表单用于确认输入一致性的密码副本。 */
  confirmNewPassword: string
}

/** 设置新密码表单的内容、状态与动作边界。 */
export interface FormResetPasswordProps {
  /** 当前表单的可访问名称。 */
  title: string

  /** 当前密码重置动作是否尚未完成。 */
  pending?: boolean

  /** 新密码通过一致性校验后触发。 */
  onSubmit: AuthFormAction<FormResetPasswordValues>
}

/** 校验两次密码输入一致性，并把密码重置副作用交给调用方。 */
export const FormResetPassword = ({
  title,
  pending = false,
  onSubmit,
}: FormResetPasswordProps) => {
  const { t } = useTranslation("auth")
  const [hasPasswordMismatch, setHasPasswordMismatch] = useState(false)

  /** 校验密码一致性并提交当前设置新密码表单。 */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const passwordEntry = formData.get("newPassword")
    const confirmationEntry = formData.get("confirmNewPassword")
    const newPassword = typeof passwordEntry === "string" ? passwordEntry : ""
    const confirmNewPassword =
      typeof confirmationEntry === "string" ? confirmationEntry : ""

    if (newPassword !== confirmNewPassword) {
      setHasPasswordMismatch(true)
      const confirmationInput = form.elements.namedItem("confirmNewPassword")

      if (confirmationInput instanceof HTMLInputElement) {
        confirmationInput.focus()
      }

      return
    }

    setHasPasswordMismatch(false)
    void onSubmit({ newPassword, confirmNewPassword })
  }

  /** 用户修改确认密码时清除上一轮不一致提示。 */
  const handleConfirmationChange = (): void => {
    setHasPasswordMismatch(false)
  }

  return (
    <form aria-busy={pending} aria-label={title} onSubmit={handleSubmit}>
      <FieldGroup>
        <FieldPassword
          autoComplete="new-password"
          disabled={pending}
          id="reset-password"
          label={t("fields.password.newLabel")}
          labelInsideInput
          name="newPassword"
          placeholder={t("fields.password.newPlaceholder")}
          required
        />

        <FieldPassword
          autoComplete="new-password"
          disabled={pending}
          error={
            hasPasswordMismatch ? t("validation.passwordMismatch") : undefined
          }
          id="reset-password-confirmation"
          label={t("fields.password.confirmLabel")}
          labelInsideInput
          name="confirmNewPassword"
          onChange={handleConfirmationChange}
          placeholder={t("fields.password.confirmPlaceholder")}
          required
        />

        <Field data-disabled={pending || undefined}>
          <Button
            className="auth-submit-button w-full"
            disabled={pending}
            size="lg"
            type="submit"
          >
            {pending ? (
              <Spinner
                aria-label={t("resetPassword.actions.submitting")}
                data-icon="inline-start"
              />
            ) : null}
            {pending
              ? t("resetPassword.actions.submitting")
              : t("resetPassword.actions.submit")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
