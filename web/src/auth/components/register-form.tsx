import type { SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import { PasswordField } from "@/auth/components/password-field"
import { SocialLoginButtons } from "@/auth/components/social-login-buttons"
import { parseCredentialsFormData, passwordMinLength } from "@/auth/schema"
import type {
  AuthFormAction,
  AuthProvider,
  RegisterFormValues,
} from "@/auth/types"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

/**
 * 注册表单属性。
 *
 * @public
 * @since 1.0.0
 */
export interface RegisterFormProps {
  /** 表单是否正在提交。 */
  pending?: boolean

  /** 提交完成浏览器原生校验后的注册数据。 */
  onSubmit?: AuthFormAction<RegisterFormValues>

  /** 选择第三方认证服务商时执行的回调。 */
  onSocialLogin?: (provider: AuthProvider) => void
}

/**
 * 渲染注册凭据和第三方认证入口。
 *
 * @param props - 注册表单属性。
 * @returns 注册表单。
 * @public
 * @since 1.0.0
 */
export function RegisterForm({
  pending = false,
  onSubmit,
  onSocialLogin,
}: RegisterFormProps) {
  const { t } = useTranslation("auth")

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit?.(parseCredentialsFormData(new FormData(event.currentTarget)))
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
          minLength={passwordMinLength}
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
