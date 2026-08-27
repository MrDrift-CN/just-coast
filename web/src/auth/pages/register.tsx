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
 * 注册页面属性。
 *
 * @public
 * @since 1.0.0
 */
export interface RegisterProps {
  /** 表单是否正在提交。 */
  pending?: boolean

  /** 提交完成浏览器原生校验后的注册数据。 */
  onSubmit?: (values: AuthFormValues) => void | Promise<void>

  /** 选择第三方认证服务商时执行的回调。 */
  onSocialLogin?: (provider: AuthProvider) => void

  /** 返回登录场景时执行的回调。 */
  onLogin?: () => void
}

/**
 * 用户注册页面。
 *
 * @param props - 注册页面属性。
 * @returns 注册页面。
 *
 * @remarks
 * 页面只收集用户名、邮箱和密码。角色与权限由用户管理模块和后端负责。
 * 未传入提交处理器时，表单不会发送请求或模拟注册结果。
 *
 * @public
 * @since 1.0.0
 */
export function Register({
  pending = false,
  onSubmit,
  onSocialLogin,
  onLogin,
}: RegisterProps) {
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
      title={t("register.title")}
      description={t("register.description")}
      footer={
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">
            {t("register.actions.hasAccount")}
          </span>
          <Button
            disabled={pending}
            type="button"
            variant="link"
            onClick={onLogin}
          >
            {t("register.actions.login")}
          </Button>
        </div>
      }
    >
      <form
        aria-busy={pending}
        aria-label={t("register.title")}
        onSubmit={handleSubmit}
      >
        <FieldGroup>
          <Field data-disabled={pending || undefined}>
            <FieldLabel htmlFor="register-username">
              {t("fields.username.label")}
            </FieldLabel>
            <Input
              className="auth-input"
              autoComplete="username"
              disabled={pending}
              id="register-username"
              name="username"
              placeholder={t("fields.username.placeholder")}
              required
            />
          </Field>

          <Field data-disabled={pending || undefined}>
            <FieldLabel htmlFor="register-email">
              {t("fields.email.label")}
            </FieldLabel>
            <Input
              className="auth-input"
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
    </AuthShell>
  )
}
