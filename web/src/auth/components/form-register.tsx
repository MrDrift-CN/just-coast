import type { SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import {
  AlternativeLoginMethods,
  type AlternativeLoginAction,
} from "@/auth/components/alternative-login-methods"
import { FieldPassword } from "@/auth/components/field-password"
import { FieldVerificationCode } from "@/auth/components/field-verification-code"
import type {
  AuthFormAction,
  RegistrationInput,
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

/** 注册表单完成浏览器校验后提交的字段。 */
export type FormRegisterValues = RegistrationInput

/** 从当前注册表单读取文本字段，非文本值按空字符串处理。 */
function parseRegisterFormData(formData: FormData): FormRegisterValues {
  const username = formData.get("username")
  const email = formData.get("email")
  const password = formData.get("password")
  const verificationCode = formData.get("verificationCode")

  return {
    username: typeof username === "string" ? username : "",
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
    verificationCode:
      typeof verificationCode === "string" ? verificationCode : "",
  }
}

/** 注册表单的提交状态与动作边界。 */
export interface FormRegisterProps {
  /** 是否正在执行注册动作；启用时禁用全部提交入口。 */
  pending?: boolean

  /** 浏览器校验通过后接收注册字段的动作。 */
  onSubmit: AuthFormAction<FormRegisterValues>

  /** 请求向当前表单中的邮箱地址发送一次性验证码。 */
  onRequestVerificationCode: AuthFormAction<string, VerificationCodeResult>

  /** 用户选择项目自有扫码登录时触发。 */
  onQrCodeLogin?: AlternativeLoginAction

  /** 用户选择 GitHub OAuth 登录时触发。 */
  onGithubLogin?: AlternativeLoginAction
}

/** 收集注册字段并把认证副作用交给调用方。 */
export const FormRegister = ({
  pending = false,
  onSubmit,
  onRequestVerificationCode,
  onQrCodeLogin,
  onGithubLogin,
}: FormRegisterProps) => {
  const { t } = useTranslation("auth")

  /** 阻止浏览器导航并提交标准化后的注册字段。 */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void onSubmit(parseRegisterFormData(new FormData(event.currentTarget)))
  }

  return (
    <form
      aria-busy={pending}
      aria-label={t("register.title")}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <Field data-disabled={pending || undefined}>
          <InputGroup className="auth-input-group">
            <InputGroupAddon
              align="inline-start"
              className="min-w-24 shrink-0 justify-start border-e border-border/60 px-3"
            >
              <FieldLabel
                className="cursor-text whitespace-nowrap"
                htmlFor="register-username"
                id="register-username-label"
              >
                {t("fields.username.label")}
              </FieldLabel>
            </InputGroupAddon>
            <InputGroupInput
              aria-labelledby="register-username-label"
              autoComplete="username"
              disabled={pending}
              id="register-username"
              name="username"
              placeholder={t("fields.username.placeholder")}
              required
            />
          </InputGroup>
        </Field>

        <Field data-disabled={pending || undefined}>
          <InputGroup className="auth-input-group">
            <InputGroupAddon
              align="inline-start"
              className="min-w-24 shrink-0 justify-start border-e border-border/60 px-3"
            >
              <FieldLabel
                className="cursor-text whitespace-nowrap"
                htmlFor="register-email"
                id="register-email-label"
              >
                {t("fields.email.label")}
              </FieldLabel>
            </InputGroupAddon>
            <InputGroupInput
              aria-labelledby="register-email-label"
              autoComplete="email"
              disabled={pending}
              id="register-email"
              name="email"
              placeholder={t("fields.email.placeholder")}
              required
              type="email"
            />
          </InputGroup>
        </Field>

        <FieldPassword
          autoComplete="new-password"
          disabled={pending}
          id="register-password"
          label={t("fields.password.label")}
          labelInsideInput
          name="password"
          placeholder={t("fields.password.placeholder")}
          required
        />

        <FieldVerificationCode
          disabled={pending}
          id="register-verification-code"
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
                aria-label={t("register.actions.submitting")}
                data-icon="inline-start"
              />
            ) : null}
            {pending
              ? t("register.actions.submitting")
              : t("register.actions.submit")}
          </Button>
        </Field>

        <AlternativeLoginMethods
          disabled={pending}
          onGithubLogin={onGithubLogin}
          onQrCodeLogin={onQrCodeLogin}
        />
      </FieldGroup>
    </form>
  )
}
