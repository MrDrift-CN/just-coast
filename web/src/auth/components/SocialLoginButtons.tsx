import {
  AppleIcon,
  GlobeIcon,
  InfinityIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldSeparator } from "@/components/ui/field"

import type { SocialAuthProvider } from "@/auth/types"

/** 第三方认证按钮组的交互属性。 */
export interface SocialLoginButtonsProps {
  /** 是否禁用全部第三方认证入口。 */
  disabled?: boolean

  /** 用户选择认证提供方时触发。 */
  onProviderSelect?: (provider: SocialAuthProvider) => void
}

/** 单个第三方认证入口的图标和翻译键配置。 */
interface SocialAuthProviderOption {
  /** 提交给认证流程的稳定提供方标识。 */
  id: SocialAuthProvider

  /** 认证按钮可见名称对应的国际化键。 */
  labelKey: "social.google" | "social.apple" | "social.meta"

  /** 在按钮中展示的提供方图标组件。 */
  icon: LucideIcon
}

/** 登录和注册界面按固定顺序展示的第三方认证入口。 */
const providers = [
  { id: "google", labelKey: "social.google", icon: GlobeIcon },
  { id: "apple", labelKey: "social.apple", icon: AppleIcon },
  { id: "meta", labelKey: "social.meta", icon: InfinityIcon },
] as const satisfies readonly SocialAuthProviderOption[]

/** 渲染可国际化的第三方登录按钮，并回传用户选择。 */
export function SocialLoginButtons({
  disabled = false,
  onProviderSelect,
}: SocialLoginButtonsProps) {
  const { t } = useTranslation("auth")

  return (
    <>
      <FieldSeparator className="text-xs uppercase">
        {t("social.divider")}
      </FieldSeparator>

      <Field className="gap-3" data-disabled={disabled || undefined}>
        {providers.map(({ id, labelKey, icon: Icon }) => (
          <Button
            className="auth-provider-button w-full"
            disabled={disabled}
            key={id}
            onClick={onProviderSelect ? () => onProviderSelect(id) : undefined}
            size="lg"
            type="button"
            variant="outline"
          >
            <Icon aria-hidden="true" data-icon="inline-start" />
            {t(labelKey)}
          </Button>
        ))}
      </Field>
    </>
  )
}
