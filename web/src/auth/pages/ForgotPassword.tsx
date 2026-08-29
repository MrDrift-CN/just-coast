import { ArrowLeftIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AuthShell } from "@/auth/components/AuthShell"
import { ForgotPasswordForm } from "@/auth/components/ForgotPasswordForm"
import { Button } from "@/components/ui/button"
import { LanguageButton } from "@/i18n"

/** 密码重置页面的阶段状态与导航动作属性。 */
export interface ForgotPasswordProps {
  /** 是否展示设置新密码阶段；否则展示申请重置说明阶段。 */
  isResetStage?: boolean

  /** 申请重置阶段完成浏览器校验后触发。 */
  onRequestReset?: () => void

  /** 设置新密码阶段通过一致性校验后触发。 */
  onResetPassword?: () => void

  /** 用户返回登录场景时触发。 */
  onLogin?: () => void
}

/** 根据路由预览状态切换申请与设置新密码阶段。 */
export function ForgotPassword({
  isResetStage = false,
  onRequestReset,
  onResetPassword,
  onLogin,
}: ForgotPasswordProps) {
  const { t } = useTranslation("auth")
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
      actions={<LanguageButton />}
      title={title}
      description={description}
      footer={
        <Button type="button" variant="link" onClick={onLogin}>
          <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
          {loginLabel}
        </Button>
      }
    >
      <ForgotPasswordForm
        isResetStage={isResetStage}
        title={title}
        onRequestReset={onRequestReset}
        onResetPassword={onResetPassword}
      />
    </AuthShell>
  )
}
