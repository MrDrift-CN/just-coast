import {
  isSupportedLocale,
  LANGUAGE_STORAGE_KEY,
  LEGACY_LANGUAGE_STORAGE_KEY,
  type LocalePreference,
  SYSTEM_LOCALE_PREFERENCE,
} from "@/i18n/locale"

/** 语言偏好持久化所需的最小浏览器存储能力。 */
type LocaleStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">

/**
 * 安全获取浏览器本地存储。
 *
 * @returns 可用的本地存储；服务端环境或浏览器拒绝访问时返回 null。
 */
function getLocaleStorage(): LocaleStorage | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    // 本地存储是可选能力；被浏览器策略禁用时继续使用内存语言状态。
    return null
  }
}

/**
 * 判断存储事件是否来自语言偏好存储。
 *
 * @param event - 浏览器派发的存储事件。
 * @returns 事件是否来自当前页面可访问的语言偏好存储。
 */
export function isLocaleStorageEvent(event: StorageEvent): boolean {
  const storage = getLocaleStorage()

  return (
    storage !== null &&
    event.storageArea === storage &&
    (event.key === LANGUAGE_STORAGE_KEY ||
      event.key === LEGACY_LANGUAGE_STORAGE_KEY)
  )
}

/**
 * 读取语言偏好，并在需要时把合法旧值迁移到当前键。
 *
 * @param storage - 可注入的存储边界，默认使用浏览器本地存储。
 * @returns 合法显式偏好；没有可用偏好或读取失败时返回 system。
 */
export function readLocalePreference(
  storage: LocaleStorage | null = getLocaleStorage()
): LocalePreference {
  if (!storage) {
    return SYSTEM_LOCALE_PREFERENCE
  }

  try {
    const currentPreference = storage.getItem(LANGUAGE_STORAGE_KEY)

    if (isSupportedLocale(currentPreference)) {
      return currentPreference
    }

    const legacyPreference = storage.getItem(LEGACY_LANGUAGE_STORAGE_KEY)

    if (!isSupportedLocale(legacyPreference)) {
      return SYSTEM_LOCALE_PREFERENCE
    }

    try {
      storage.setItem(LANGUAGE_STORAGE_KEY, legacyPreference)
      storage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY)
    } catch {
      // 迁移写入失败时继续采用合法旧值，并保留旧键供下次重试。
    }

    return legacyPreference
  } catch {
    // 权限拒绝、容量不足或损坏实现都不应阻止应用启动。
    return SYSTEM_LOCALE_PREFERENCE
  }
}

/**
 * 保存显式语言偏好，或在跟随系统时清除新旧存储键。
 *
 * @param preference - 已通过运行时校验的语言偏好。
 * @param storage - 可注入的存储边界，默认使用浏览器本地存储。
 */
export function writeLocalePreference(
  preference: LocalePreference,
  storage: LocaleStorage | null = getLocaleStorage()
): void {
  if (!storage) {
    return
  }

  try {
    if (preference === SYSTEM_LOCALE_PREFERENCE) {
      storage.removeItem(LANGUAGE_STORAGE_KEY)
      storage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY)
      return
    }

    storage.setItem(LANGUAGE_STORAGE_KEY, preference)
    storage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY)
  } catch {
    // 持久化失败不影响本次会话已经生效的内存语言状态。
  }
}
