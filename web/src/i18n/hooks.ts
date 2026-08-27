import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"

import { DEFAULT_NAMESPACE } from "@/i18n/config"
import {
  isSupportedLocale,
  LANGUAGE_STORAGE_KEY,
  type LocalePreference,
  normalizeLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/i18n/locale"

/**
 * 语言状态与切换操作。
 *
 * @public
 * @since 1.0.0
 */
export interface UseLocaleResult {
  /** 当前实际生效的语言。 */
  locale: SupportedLocale

  /** 用户选择的语言偏好。 */
  preference: LocalePreference

  /** 应用支持的语言列表。 */
  supportedLocales: typeof SUPPORTED_LOCALES

  /** 修改用户语言偏好。 */
  setLocale: (preference: LocalePreference) => Promise<void>
}

/**
 * 读取用户保存的语言偏好。
 *
 * @returns 已保存的语言，未保存或内容无效时返回 system。
 *
 * @internal
 * @since 1.0.0
 */
function readLocalePreference(): LocalePreference {
  const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

  return isSupportedLocale(storedLocale) ? storedLocale : "system"
}

/**
 * 提供当前语言和语言切换能力。
 *
 * @returns 语言状态与切换操作。
 *
 * @remarks
 * system 会清除显式偏好并重新执行浏览器语言检测；显式语言只由本 Hook
 * 写入本地存储，避免首次自动检测结果被永久缓存。
 *
 * @public
 * @since 1.0.0
 */
export function useLocale(): UseLocaleResult {
  const { i18n } = useTranslation(DEFAULT_NAMESPACE)
  const [preference, setPreference] = useState(readLocalePreference)

  const setLocale = useCallback(
    async (nextPreference: LocalePreference) => {
      if (nextPreference === "system") {
        window.localStorage.removeItem(LANGUAGE_STORAGE_KEY)
        await i18n.changeLanguage()
      } else {
        await i18n.changeLanguage(nextPreference)
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextPreference)
      }

      setPreference(nextPreference)
    },
    [i18n]
  )

  return {
    locale: normalizeLocale(i18n.resolvedLanguage),
    preference,
    setLocale,
    supportedLocales: SUPPORTED_LOCALES,
  }
}
