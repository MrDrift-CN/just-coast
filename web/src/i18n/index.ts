import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import { I18N_CONFIG } from "@/i18n/config"
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/locale"
import { readLocalePreference } from "@/i18n/preference"

/**
 * 将当前应用语言同步到文档根元素。
 *
 * @param language - i18next 当前解析出的语言。
 * @returns 无返回值。
 */
function syncDocumentLocale(language: string): void {
  const locale = normalizeLocale(language)

  document.documentElement.lang = locale
  document.documentElement.dir = i18n.dir(locale)
}

/** 移除当前模块注册的文档语言同步监听。 */
function removeDocumentLocaleListener(): void {
  i18n.off("languageChanged", syncDocumentLocale)
}

if (!i18n.isInitialized) {
  // 先迁移合法旧偏好，确保检测器首屏只读取当前存储键。
  void readLocalePreference()
  void i18n.use(LanguageDetector).use(initReactI18next).init(I18N_CONFIG)
}

syncDocumentLocale(i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LOCALE)
i18n.on("languageChanged", syncDocumentLocale)

if (import.meta.hot) {
  import.meta.hot.dispose(removeDocumentLocaleListener)
}

export {
  DEFAULT_NAMESPACE,
  I18N_CONFIG,
  NAMESPACES,
  RESOURCES,
} from "@/i18n/config"
export { LanguageButton } from "@/i18n/LanguageButton"
export { useLocale } from "@/i18n/useLocale"
export { i18n }
export {
  canonicalizeDetectedLocale,
  DEFAULT_LOCALE,
  detectSystemLocale,
  isLocalePreference,
  isSupportedLocale,
  LANGUAGE_STORAGE_KEY,
  LEGACY_LANGUAGE_STORAGE_KEY,
  normalizeLocale,
  resolveLocalePreference,
  SUPPORTED_LOCALES,
  SYSTEM_LOCALE_PREFERENCE,
} from "@/i18n/locale"
export type { LocalePreference, SupportedLocale } from "@/i18n/locale"
