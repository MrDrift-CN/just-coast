import { GitForkIcon, ScanLineIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldSeparator } from "@/components/ui/field"

/** 不接收参数的同步或异步登录动作。 */
export type AlternativeLoginAction = () => void | Promise<void>

/** 扫码与 GitHub 登录入口的交互属性。 */
export interface AlternativeLoginMethodsProps {
  /** 是否禁用全部备选登录入口。 */
  disabled?: boolean
  /** 用户选择项目自有扫码登录时触发。 */
  onQrCodeLogin?: AlternativeLoginAction
  /** 用户选择 GitHub OAuth 登录时触发。 */
  onGithubLogin?: AlternativeLoginAction
}

/** 渲染项目自有扫码登录和 GitHub 登录两个稳定入口。 */
export const AlternativeLoginMethods = ({
  disabled = false,
  onQrCodeLogin,
  onGithubLogin,
}: AlternativeLoginMethodsProps) => {
  const { t } = useTranslation("auth")

  return (
    <>
      <FieldSeparator className="text-xs uppercase">
        {t("alternativeLogin.divider")}
      </FieldSeparator>

      <Field
        className="grid gap-3 sm:grid-cols-2"
        data-disabled={disabled || undefined}
      >
        <Button
          className="auth-provider-button w-full"
          disabled={disabled || !onQrCodeLogin}
          onClick={() => void onQrCodeLogin?.()}
          size="lg"
          type="button"
          variant="outline"
        >
          <ScanLineIcon aria-hidden="true" data-icon="inline-start" />
          {t("alternativeLogin.qrCode")}
        </Button>

        <Button
          className="auth-provider-button w-full"
          disabled={disabled || !onGithubLogin}
          onClick={() => void onGithubLogin?.()}
          size="lg"
          type="button"
          variant="outline"
        >
          <GitForkIcon aria-hidden="true" data-icon="inline-start" />
          {t("alternativeLogin.github")}
        </Button>
      </Field>
    </>
  )
}
