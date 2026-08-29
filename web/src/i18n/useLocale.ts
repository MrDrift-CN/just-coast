import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { DEFAULT_NAMESPACE } from "@/i18n/config"
import {
  type LocalePreference,
  normalizeLocale,
  resolveLocalePreference,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/i18n/locale"
import {
  isLocaleStorageEvent,
  readLocalePreference,
  writeLocalePreference,
} from "@/i18n/preference"

/** 语言状态与切换操作。 */
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
 * 提供当前语言、持久化偏好和跨标签页同步能力。
 *
 * @returns 语言状态与切换操作。
 */
export function useLocale(): UseLocaleResult {
  const { i18n } = useTranslation(DEFAULT_NAMESPACE)
  const [preference, setPreference] = useState(readLocalePreference)

  /** 将已校验偏好应用到 i18next 和 React 状态。 */
  const applyLocalePreference = useCallback(
    async (nextPreference: LocalePreference) => {
      await i18n.changeLanguage(resolveLocalePreference(nextPreference))
      setPreference(nextPreference)
    },
    [i18n]
  )

  /** 应用用户选择，并在语言切换成功后持久化偏好。 */
  const setLocale = useCallback(
    async (nextPreference: LocalePreference) => {
      await applyLocalePreference(nextPreference)
      writeLocalePreference(nextPreference)
    },
    [applyLocalePreference]
  )

  useEffect(() => {
    /** 将其他标签页的合法语言偏好变化同步到当前页面。 */
    function handleLocaleStorageChange(event: StorageEvent): void {
      if (!isLocaleStorageEvent(event)) {
        return
      }

      void applyLocalePreference(readLocalePreference()).catch(() => {
        // 内置资源切换失败时保留当前可用语言，避免产生未处理的 Promise。
      })
    }

    window.addEventListener("storage", handleLocaleStorageChange)

    return () => {
      window.removeEventListener("storage", handleLocaleStorageChange)
    }
  }, [applyLocalePreference])

  return {
    locale: normalizeLocale(i18n.resolvedLanguage),
    preference,
    setLocale,
    supportedLocales: SUPPORTED_LOCALES,
  }
}
