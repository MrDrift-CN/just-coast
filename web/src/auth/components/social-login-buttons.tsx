import {
  AppleIcon,
  GlobeIcon,
  InfinityIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Field, FieldSeparator } from "@/components/ui/field"

import type { AuthProvider } from "@/auth/types"

/**
 * 第三方认证按钮组属性。
 *
 * @public
 * @since 1.0.0
 */
export interface SocialLoginButtonsProps {
  /** 是否禁用全部第三方认证入口。 */
  disabled?: boolean

  /** 选择认证服务商时执行的回调。 */
  onProviderSelect?: (provider: AuthProvider) => void
}

const providers = [
  { id: "google", labelKey: "social.google", icon: GlobeIcon },
  { id: "apple", labelKey: "social.apple", icon: AppleIcon },
  { id: "meta", labelKey: "social.meta", icon: InfinityIcon },
] as const satisfies readonly {
  id: AuthProvider
  labelKey: "social.google" | "social.apple" | "social.meta"
  icon: LucideIcon
}[]

/**
 * 渲染登录与注册页面共用的第三方认证入口。
 *
 * @param props - 第三方认证按钮组属性。
 * @returns 第三方认证操作区。
 *
 * @public
 * @since 1.0.0
 */
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
