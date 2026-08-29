import type { SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import { PasswordField } from "@/auth/components/PasswordField"
import { SocialLoginButtons } from "@/auth/components/SocialLoginButtons"
import type { AuthFormAction, SocialAuthProvider } from "@/auth/types"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

/** 登录表单完成浏览器校验后提交的字段。 */
export interface LoginFormValues {
  /** 用户用于显示和账号识别的名称。 */
  username: string
  /** 用户用于认证和接收账号通知的邮箱地址。 */
  email: string
  /** 尚未加密传输前的原始密码，不得写入日志或持久化。 */
  password: string
}

/** 从当前登录表单读取文本字段，非文本值按空字符串处理。 */
function parseLoginFormData(formData: FormData): LoginFormValues {
  const username = formData.get("username")
  const email = formData.get("email")
  const password = formData.get("password")

  return {
    username: typeof username === "string" ? username : "",
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
  }
}

/** 登录表单的提交状态与动作边界。 */
export interface LoginFormProps {
  /** 是否正在执行登录动作；启用时禁用全部提交入口。 */
  pending?: boolean

  /** 浏览器校验通过后接收登录字段的动作。 */
  onSubmit?: AuthFormAction<LoginFormValues>

  /** 用户选择第三方认证提供方时触发。 */
  onSocialLogin?: (provider: SocialAuthProvider) => void
}

/** 收集登录字段并把认证副作用交给调用方。 */
export function LoginForm({
  pending = false,
  onSubmit,
  onSocialLogin,
}: LoginFormProps) {
  const { t } = useTranslation("auth")

  /** 阻止浏览器导航并提交标准化后的登录字段。 */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit?.(parseLoginFormData(new FormData(event.currentTarget)))
  }

  return (
    <form
      aria-busy={pending}
      aria-label={t("login.title")}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <Field data-disabled={pending || undefined}>
          <FieldLabel htmlFor="login-username" id="login-username-label">
            {t("fields.username.label")}
          </FieldLabel>
          <Input
            className="auth-input"
            aria-labelledby="login-username-label"
            autoComplete="username"
            disabled={pending}
            id="login-username"
            name="username"
            placeholder={t("fields.username.placeholder")}
            required
          />
        </Field>

        <Field data-disabled={pending || undefined}>
          <FieldLabel htmlFor="login-email" id="login-email-label">
            {t("fields.email.label")}
          </FieldLabel>
          <Input
            className="auth-input"
            aria-labelledby="login-email-label"
            autoComplete="email"
            disabled={pending}
            id="login-email"
            name="email"
            placeholder={t("fields.email.placeholder")}
            required
            type="email"
          />
        </Field>

        <PasswordField
          autoComplete="current-password"
          disabled={pending}
          id="login-password"
          label={t("fields.password.label")}
          name="password"
          placeholder={t("fields.password.placeholder")}
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
                aria-label={t("login.actions.submitting")}
                data-icon="inline-start"
              />
            ) : null}
            {pending
              ? t("login.actions.submitting")
              : t("login.actions.submit")}
          </Button>
        </Field>

        <SocialLoginButtons
          disabled={pending}
          onProviderSelect={onSocialLogin}
        />
      </FieldGroup>
    </form>
  )
}
