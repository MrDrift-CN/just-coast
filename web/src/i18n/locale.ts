/**
 * 默认语言。
 *
 * @readonly
 * @public
 * @since 1.0.0
 */
export const DEFAULT_LOCALE = "zh-CN" as const

/**
 * 应用支持的语言。
 *
 * @remarks
 * 使用 BCP 47 语言标签；新增语言时必须同步增加所有业务命名空间资源。
 *
 * @readonly
 * @public
 * @since 1.0.0
 */
export const SUPPORTED_LOCALES = ["zh-CN", "en-US"] as const

/**
 * 用户语言偏好的本地存储键。
 *
 * @readonly
 * @public
 * @since 1.0.0
 */
export const LANGUAGE_STORAGE_KEY = "just-coast.language" as const

/** 应用支持的语言。 */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/** 用户可选择的语言偏好。 */
export type LocalePreference = SupportedLocale | "system"

/**
 * 判断输入是否为应用支持的语言。
 *
 * @param value - 待检查的语言标签。
 * @returns 输入是否为支持的语言。
 *
 * @public
 * @since 1.0.0
 */
export function isSupportedLocale(
  value: string | null | undefined
): value is SupportedLocale {
  return SUPPORTED_LOCALES.some((locale) => locale === value)
}

/**
 * 将检测到的语言归一化为应用支持的语言。
 *
 * @param value - 浏览器、路由或存储中的语言标签。
 * @returns 与输入最接近的应用语言；无法匹配时返回默认语言。
 *
 * @public
 * @since 1.0.0
 */
export function normalizeLocale(
  value: string | null | undefined
): SupportedLocale {
  const normalized = value?.trim().replace("_", "-").toLowerCase()

  if (normalized?.startsWith("en")) {
    return "en-US"
  }

  if (normalized?.startsWith("zh")) {
    return "zh-CN"
  }

  return DEFAULT_LOCALE
}
