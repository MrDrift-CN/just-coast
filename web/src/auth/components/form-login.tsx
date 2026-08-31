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
  LoginCredentials,
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

/** 登录表单完成浏览器校验后提交的字段。 */
export type FormLoginValues = LoginCredentials

/** 从当前登录表单读取文本字段，非文本值按空字符串处理。 */
function parseLoginFormData(formData: FormData): FormLoginValues {
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

/** 登录表单的提交状态与动作边界。 */
export interface FormLoginProps {
  /** 是否正在执行登录动作；启用时禁用全部提交入口。 */
  pending?: boolean

  /** 浏览器校验通过后接收登录字段的动作。 */
  onSubmit: AuthFormAction<FormLoginValues>

  /** 请求向当前表单中的邮箱地址发送一次性验证码。 */
  onRequestVerificationCode: AuthFormAction<string, VerificationCodeResult>

  /** 用户选择项目自有扫码登录时触发。 */
  onQrCodeLogin?: AlternativeLoginAction

  /** 用户选择 GitHub OAuth 登录时触发。 */
  onGithubLogin?: AlternativeLoginAction
}

/** 收集登录字段并把认证副作用交给调用方。 */
export const FormLogin = ({
  pending = false,
  onSubmit,
  onRequestVerificationCode,
  onQrCodeLogin,
  onGithubLogin,
}: FormLoginProps) => {
  const { t } = useTranslation("auth")

  /** 阻止浏览器导航并提交标准化后的登录字段。 */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void onSubmit(parseLoginFormData(new FormData(event.currentTarget)))
  }

  return (
    <form
      aria-busy={pending}
      aria-label={t("login.title")}
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
                htmlFor="login-username"
                id="login-username-label"
              >
                {t("fields.username.label")}
              </FieldLabel>
            </InputGroupAddon>
            <InputGroupInput
              aria-labelledby="login-username-label"
              autoComplete="username"
              disabled={pending}
              id="login-username"
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
                htmlFor="login-email"
                id="login-email-label"
              >
                {t("fields.email.label")}
              </FieldLabel>
            </InputGroupAddon>
            <InputGroupInput
              aria-labelledby="login-email-label"
              autoComplete="email"
              disabled={pending}
              id="login-email"
              name="email"
              placeholder={t("fields.email.placeholder")}
              required
              type="email"
            />
          </InputGroup>
        </Field>

        <FieldPassword
          autoComplete="current-password"
          disabled={pending}
          id="login-password"
          label={t("fields.password.label")}
          labelInsideInput
          name="password"
          placeholder={t("fields.password.placeholder")}
          required
        />

        <FieldVerificationCode
          disabled={pending}
          id="login-verification-code"
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
                aria-label={t("login.actions.submitting")}
                data-icon="inline-start"
              />
            ) : null}
            {pending
              ? t("login.actions.submitting")
              : t("login.actions.submit")}
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
