import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import { I18N_CONFIG } from "@/i18n/config"
import { DEFAULT_LOCALE, normalizeLocale } from "@/i18n/locale"

/**
 * 将当前应用语言同步到文档根元素。
 *
 * @param language - i18next 当前解析出的语言。
 * @returns 无返回值。
 *
 * @internal
 * @since 1.0.0
 */
function syncDocumentLocale(language: string) {
  const locale = normalizeLocale(language)

  document.documentElement.lang = locale
  document.documentElement.dir = i18n.dir(locale)
}

if (!i18n.isInitialized) {
  void i18n.use(LanguageDetector).use(initReactI18next).init(I18N_CONFIG)
}

syncDocumentLocale(i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LOCALE)
i18n.on("languageChanged", syncDocumentLocale)

export {
  DEFAULT_NAMESPACE,
  I18N_CONFIG,
  NAMESPACES,
  RESOURCES,
} from "@/i18n/config"
export { useLocale } from "@/i18n/hooks"
export { i18n }
export {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LANGUAGE_STORAGE_KEY,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from "@/i18n/locale"
export type { LocalePreference, SupportedLocale } from "@/i18n/locale"
