import type { SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import { PasswordField } from "@/auth/components/PasswordField"
import { SocialLoginButtons } from "@/auth/components/SocialLoginButtons"
import type { AuthFormAction, SocialAuthProvider } from "@/auth/types"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

/** 注册表单完成浏览器校验后提交的字段。 */
export interface RegisterFormValues {
  /** 用户用于显示和账号识别的名称。 */
  username: string
  /** 用户用于认证和接收账号通知的邮箱地址。 */
  email: string
  /** 尚未加密传输前的原始密码，不得写入日志或持久化。 */
  password: string
}

/** 从当前注册表单读取文本字段，非文本值按空字符串处理。 */
function parseRegisterFormData(formData: FormData): RegisterFormValues {
  const username = formData.get("username")
  const email = formData.get("email")
  const password = formData.get("password")

  return {
    username: typeof username === "string" ? username : "",
    email: typeof email === "string" ? email : "",
    password: typeof password === "string" ? password : "",
  }
}

/** 注册表单的提交状态与动作边界。 */
export interface RegisterFormProps {
  /** 是否正在执行注册动作；启用时禁用全部提交入口。 */
  pending?: boolean

  /** 浏览器校验通过后接收注册字段的动作。 */
  onSubmit?: AuthFormAction<RegisterFormValues>

  /** 用户选择第三方认证提供方时触发。 */
  onSocialLogin?: (provider: SocialAuthProvider) => void
}

/** 收集注册字段并把认证副作用交给调用方。 */
export function RegisterForm({
  pending = false,
  onSubmit,
  onSocialLogin,
}: RegisterFormProps) {
  const { t } = useTranslation("auth")

  /** 阻止浏览器导航并提交标准化后的注册字段。 */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit?.(parseRegisterFormData(new FormData(event.currentTarget)))
  }

  return (
    <form
      aria-busy={pending}
      aria-label={t("register.title")}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <Field data-disabled={pending || undefined}>
          <FieldLabel htmlFor="register-username" id="register-username-label">
            {t("fields.username.label")}
          </FieldLabel>
          <Input
            className="auth-input"
            aria-labelledby="register-username-label"
            autoComplete="username"
            disabled={pending}
            id="register-username"
            name="username"
            placeholder={t("fields.username.placeholder")}
            required
          />
        </Field>

        <Field data-disabled={pending || undefined}>
          <FieldLabel htmlFor="register-email" id="register-email-label">
            {t("fields.email.label")}
          </FieldLabel>
          <Input
            className="auth-input"
            aria-labelledby="register-email-label"
            autoComplete="email"
            disabled={pending}
            id="register-email"
            name="email"
            placeholder={t("fields.email.placeholder")}
            required
            type="email"
          />
        </Field>

        <PasswordField
          autoComplete="new-password"
          disabled={pending}
          id="register-password"
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
                aria-label={t("register.actions.submitting")}
                data-icon="inline-start"
              />
            ) : null}
            {pending
              ? t("register.actions.submitting")
              : t("register.actions.submit")}
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
