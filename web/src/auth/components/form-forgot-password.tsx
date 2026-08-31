import type { SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import { FieldVerificationCode } from "@/auth/components/field-verification-code"
import type {
  AuthFormAction,
  PasswordResetVerificationInput,
  VerificationCodeResult,
} from "@/auth/types"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"

/** 找回密码进入设置新密码阶段前需要验证的字段。 */
export type FormForgotPasswordValues = PasswordResetVerificationInput

/** 从找回密码表单读取邮箱和验证码，非文本值按空字符串处理。 */
function parseForgotPasswordFormData(
  formData: FormData
): FormForgotPasswordValues {
  const email = formData.get("email")
  const verificationCode = formData.get("verificationCode")

  return {
    email: typeof email === "string" ? email : "",
    verificationCode:
      typeof verificationCode === "string" ? verificationCode : "",
  }
}

/** 找回密码表单的内容、状态与动作边界。 */
export interface FormForgotPasswordProps {
  /** 当前表单的可访问名称。 */
  title: string

  /** 当前验证码校验动作是否尚未完成。 */
  pending?: boolean

  /** 请求向当前表单中的邮箱地址发送一次性验证码。 */
  onRequestVerificationCode: AuthFormAction<string, VerificationCodeResult>

  /** 邮箱和验证码完成浏览器校验后触发。 */
  onSubmit: AuthFormAction<FormForgotPasswordValues>
}

/** 收集邮箱与验证码，并把密码找回副作用交给调用方。 */
export const FormForgotPassword = ({
  title,
  pending = false,
  onRequestVerificationCode,
  onSubmit,
}: FormForgotPasswordProps) => {
  const { t } = useTranslation("auth")

  /** 阻止浏览器导航并提交标准化后的密码找回字段。 */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void onSubmit(
      parseForgotPasswordFormData(new FormData(event.currentTarget))
    )
  }

  return (
    <form aria-busy={pending} aria-label={title} onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-disabled={pending || undefined}>
          <InputGroup className="auth-input-group">
            <InputGroupAddon
              align="inline-start"
              className="min-w-24 shrink-0 justify-start border-e border-border/60 px-3"
            >
              <FieldLabel
                className="cursor-text whitespace-nowrap"
                htmlFor="forgot-password-email"
                id="forgot-password-email-label"
              >
                {t("fields.email.label")}
              </FieldLabel>
            </InputGroupAddon>
            <InputGroupInput
              aria-labelledby="forgot-password-email-label"
              autoComplete="email"
              disabled={pending}
              id="forgot-password-email"
              name="email"
              placeholder={t("fields.email.placeholder")}
              required
              type="email"
            />
          </InputGroup>
        </Field>

        <FieldVerificationCode
          disabled={pending}
          id="forgot-password-verification-code"
          onRequest={onRequestVerificationCode}
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
                aria-label={t("forgotPassword.actions.submitting")}
                data-icon="inline-start"
              />
            ) : null}
            {pending
              ? t("forgotPassword.actions.submitting")
              : t("forgotPassword.actions.submit")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
