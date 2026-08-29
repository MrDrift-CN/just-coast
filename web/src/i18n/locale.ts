/** 无有效用户偏好或系统语言匹配时使用的默认语言。 */
export const DEFAULT_LOCALE = "zh-CN" as const

/**
 * 应用支持的语言。
 *
 * @remarks
 * 使用 BCP 47 语言标签；新增语言时必须同步增加所有业务命名空间资源。
 */
export const SUPPORTED_LOCALES = ["zh-CN", "en-US"] as const

/** 用户显式语言偏好的当前本地存储键。 */
export const LANGUAGE_STORAGE_KEY = "preferences.language" as const

/** 旧版语言偏好键，仅用于向当前存储键迁移。 */
export const LEGACY_LANGUAGE_STORAGE_KEY = "just-coast.language" as const

/** 表示跟随浏览器或操作系统语言的偏好值。 */
export const SYSTEM_LOCALE_PREFERENCE = "system" as const

/** 应用支持的语言。 */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/** 用户可选择的语言偏好。 */
export type LocalePreference = SupportedLocale | typeof SYSTEM_LOCALE_PREFERENCE

/**
 * 尝试把语言标签匹配到项目支持的区域语言。
 *
 * @param value - 浏览器、存储或外部输入中的语言标签。
 * @returns 匹配到的支持语言；无法匹配时返回 null。
 */
function matchSupportedLocale(
  value: string | null | undefined
): SupportedLocale | null {
  const normalized = value?.trim().replaceAll("_", "-").toLowerCase()
  const [language] = normalized?.split("-") ?? []

  if (language === "en") {
    return "en-US"
  }

  if (language === "zh") {
    return "zh-CN"
  }

  return null
}

/**
 * 判断输入是否为应用支持的语言。
 *
 * @param value - 待检查的语言标签。
 * @returns 输入是否为支持的语言。
 */
export function isSupportedLocale(
  value: string | null | undefined
): value is SupportedLocale {
  return SUPPORTED_LOCALES.some((locale) => locale === value)
}

/**
 * 判断输入是否为可保存的语言偏好。
 *
 * @param value - 语言选择控件或外部状态提供的值。
 * @returns 输入是否为支持语言或 system。
 */
export function isLocalePreference(value: unknown): value is LocalePreference {
  return (
    typeof value === "string" &&
    (value === SYSTEM_LOCALE_PREFERENCE || isSupportedLocale(value))
  )
}

/**
 * 将检测器提供的语言标签转换为项目支持的区域标签。
 *
 * @param value - 语言检测器提供的原始标签。
 * @returns 匹配到的项目语言；不支持的标签保持原值供 i18next 继续筛选。
 */
export function canonicalizeDetectedLocale(value: string): string {
  return matchSupportedLocale(value) ?? value
}

/**
 * 将检测到的语言归一化为应用支持的语言。
 *
 * @param value - 浏览器、存储或外部输入中的语言标签。
 * @returns 与输入最接近的应用语言；无法匹配时返回默认语言。
 */
export function normalizeLocale(
  value: string | null | undefined
): SupportedLocale {
  return matchSupportedLocale(value) ?? DEFAULT_LOCALE
}

/**
 * 从浏览器语言列表中解析首个受支持的系统语言。
 *
 * @returns 支持的系统语言；浏览器不可用或没有匹配项时返回默认语言。
 */
export function detectSystemLocale(): SupportedLocale {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE
  }

  for (const language of navigator.languages) {
    const locale = matchSupportedLocale(language)

    if (locale) {
      return locale
    }
  }

  return normalizeLocale(navigator.language)
}

/**
 * 将用户偏好解析为本次应实际生效的语言。
 *
 * @param preference - 用户显式语言或跟随系统的偏好。
 * @returns 应用支持的实际语言。
 */
export function resolveLocalePreference(
  preference: LocalePreference
): SupportedLocale {
  return preference === SYSTEM_LOCALE_PREFERENCE
    ? detectSystemLocale()
    : preference
}
