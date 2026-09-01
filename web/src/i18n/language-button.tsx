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
import { isLocalePreference } from "@/i18n/locale"
import { useLocale } from "@/i18n/useLocale"

/** 提供可在各界面复用的应用语言选择入口。 */
export const LanguageButton = () => {
  const { t } = useTranslation("common")
  const { preference, setLocale } = useLocale()

  /** 校验菜单值后应用语言偏好。 */
  async function handleLocaleChange(value: unknown): Promise<void> {
    if (!isLocalePreference(value)) {
      return
    }

    try {
      await setLocale(value)
    } catch {
      // 内置资源切换失败时保留当前可用语言和偏好。
    }
  }

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
            onValueChange={(value) => void handleLocaleChange(value)}
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
