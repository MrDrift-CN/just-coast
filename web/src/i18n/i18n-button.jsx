import { LanguagesIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useLocale } from "@/i18n/hooks"

/**
 * 提供可在任意界面复用的应用语言选择入口。
 *
 * @returns 国际化语言选择按钮。
 *
 * @public
 * @since 1.0.0
 */
export function I18nButton() {
  const { t } = useTranslation("common")
  const { preference, setLocale } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={t("language.label")}
            size="icon-lg"
            variant="outline"
          />
        }
      >
        <LanguagesIcon aria-hidden="true" data-icon="inline-start" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("language.label")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            onValueChange={(value) => void setLocale(value)}
            value={preference}
          >
            <DropdownMenuRadioItem closeOnClick value="system">
              {t("language.system")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem closeOnClick value="zh-CN">
              {t("language.options.zhCN")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem closeOnClick value="en-US">
              {t("language.options.enUS")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
