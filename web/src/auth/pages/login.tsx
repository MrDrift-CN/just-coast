import type { FormEvent } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { I18nButton } from "@/i18n/i18n-button"

import { AuthShell } from "@/auth/components/auth-shell"
import { PasswordField } from "@/auth/components/password-field"
import { SocialLoginButtons } from "@/auth/components/social-login-buttons"
import type { AuthFormValues, AuthProvider } from "@/auth/types"

/**
 * 登录页面属性。
 *
 * @public
 * @since 1.0.0
 */
export interface LoginProps {
  /** 表单是否正在提交。 */
  pending?: boolean

  /** 提交完成浏览器原生校验后的登录数据。 */
  onSubmit?: (values: AuthFormValues) => void | Promise<void>

  /** 选择第三方认证服务商时执行的回调。 */
  onSocialLogin?: (provider: AuthProvider) => void

  /** 进入忘记密码场景时执行的回调。 */
  onForgotPassword?: () => void

  /** 进入注册场景时执行的回调。 */
  onRegister?: () => void
}

/**
 * 用户登录页面。
 *
 * @param props - 登录页面属性。
 * @returns 登录页面。
 *
 * @remarks
 * 页面只收集用户名、邮箱和密码。角色与权限不在登录阶段分配。
 * 未传入提交处理器时，表单不会发送请求或模拟登录结果。
 *
 * @public
 * @since 1.0.0
 */
export function Login({
  pending = false,
  onSubmit,
  onSocialLogin,
  onForgotPassword,
  onRegister,
}: LoginProps) {
  const { t } = useTranslation("auth")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!onSubmit) {
      return
    }

    const formData = new FormData(event.currentTarget)

    void onSubmit({
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    })
  }

  return (
    <AuthShell
      actions={<I18nButton />}
      title={t("login.title")}
      description={t("login.description")}
      footer={
        <div className="flex flex-col items-center gap-1 sm:flex-row">
          <Button
            disabled={pending}
            type="button"
            variant="link"
            onClick={onForgotPassword}
          >
            {t("login.actions.forgotPassword")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("login.actions.noAccount")}
          </span>
          <Button
            disabled={pending}
            type="button"
            variant="link"
            onClick={onRegister}
          >
            {t("login.actions.register")}
          </Button>
        </div>
      }
    >
      <form
        aria-busy={pending}
        aria-label={t("login.title")}
        onSubmit={handleSubmit}
      >
        <FieldGroup>
          <Field data-disabled={pending || undefined}>
            <FieldLabel htmlFor="login-username">
              {t("fields.username.label")}
            </FieldLabel>
            <Input
              className="auth-input"
              autoComplete="username"
              disabled={pending}
              id="login-username"
              name="username"
              placeholder={t("fields.username.placeholder")}
              required
            />
          </Field>

          <Field data-disabled={pending || undefined}>
            <FieldLabel htmlFor="login-email">
              {t("fields.email.label")}
            </FieldLabel>
            <Input
              className="auth-input"
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
            minLength={8}
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
    </AuthShell>
  )
}
