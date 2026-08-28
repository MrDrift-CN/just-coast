import { ArrowLeftIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AuthShell } from "@/auth/components/auth-shell"
import { ForgetForm } from "@/auth/components/forget-form"
import type {
  AuthFormAction,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/auth/types"
import { Button } from "@/components/ui/button"
import { I18nButton } from "@/i18n/i18n-button"

/**
 * 忘记密码页面属性。
 *
 * @public
 * @since 1.0.0
 */
export interface ForgotPasswordProps {
  /** 表单是否正在提交。 */
  pending?: boolean

  /** 后端签发的密码重置令牌；存在时页面进入设置新密码阶段。 */
  resetToken?: string

  /** 提交完成浏览器原生校验后的邮箱地址。 */
  onRequestReset?: AuthFormAction<ForgotPasswordFormValues>

  /** 提交完成页面校验后的新密码和对应的重置令牌。 */
  onResetPassword?: (
    values: ResetPasswordFormValues,
    resetToken: string
  ) => void | Promise<void>

  /** 返回登录场景时执行的回调。 */
  onLogin?: () => void
}

/**
 * 忘记密码页面。
 *
 * @param props - 忘记密码页面属性。
 * @returns 忘记密码页面。
 *
 * @remarks
 * 页面根据重置令牌组装请求重置或设置新密码场景。令牌的读取与校验由路由和后端
 * 集成层负责，页面不持有邮件协议或接口实现。
 *
 * @public
 * @since 1.0.0
 */
export function ForgotPassword({
  pending = false,
  resetToken,
  onRequestReset,
  onResetPassword,
  onLogin,
}: ForgotPasswordProps) {
  const { t } = useTranslation("auth")
  const isResetStage = Boolean(resetToken)
  const title = isResetStage
    ? t("resetPassword.title")
    : t("forgotPassword.title")
  const description = isResetStage
    ? t("resetPassword.description")
    : t("forgotPassword.description")
  const loginLabel = isResetStage
    ? t("resetPassword.actions.login")
    : t("forgotPassword.actions.login")

  return (
    <AuthShell
      actions={<I18nButton />}
      title={title}
      description={description}
      footer={
        <Button
          disabled={pending}
          type="button"
          variant="link"
          onClick={onLogin}
        >
          <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
          {loginLabel}
        </Button>
      }
    >
      <ForgetForm
        pending={pending}
        resetToken={resetToken}
        title={title}
        onRequestReset={onRequestReset}
        onResetPassword={onResetPassword}
      />
    </AuthShell>
  )
}
