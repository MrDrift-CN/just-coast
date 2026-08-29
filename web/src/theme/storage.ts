import {
  DEFAULT_THEME_CONFIG,
  cloneThemeConfig,
  parseThemeConfig,
  serializeThemeConfig,
} from "@/theme/config"
import type { ThemeConfig } from "@/theme/types"

/** 当前主题配置使用的职责型本地存储键。 */
export const THEME_STORAGE_KEY = "preferences.theme" as const

/** 旧版品牌主题键，仅用于向当前存储键迁移。 */
export const LEGACY_THEME_STORAGE_KEY = "just-coast.theme" as const

/** 主题持久化所需的最小浏览器存储能力。 */
type ThemeStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">

/**
 * 安全获取浏览器本地存储。
 *
 * @returns 可用的本地存储；服务端环境或浏览器拒绝访问时返回 null。
 */
function getThemeStorage(): ThemeStorage | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    // 存储不可用时主题仍可在当前会话中以内存状态运行。
    return null
  }
}

/**
 * 尝试解析一份已序列化的主题配置。
 *
 * @param serialized - 从不可信存储边界读取的原始值。
 * @param fallback - 缺失字段使用的完整主题配置。
 * @returns 合法主题配置；值缺失或损坏时返回 null。
 */
function parseStoredThemeConfig(
  serialized: string | null,
  fallback: ThemeConfig
): ThemeConfig | null {
  if (!serialized) {
    return null
  }

  try {
    return parseThemeConfig(serialized, fallback)
  } catch {
    // 单个损坏值不是致命错误；调用方会继续检查旧键或安全默认值。
    return null
  }
}

/**
 * 判断浏览器存储事件是否可能改变当前主题配置。
 *
 * @param event - 浏览器派发的跨文档存储事件。
 * @param storageKey - ThemeProvider 当前使用的存储键。
 * @returns 事件是否来自同一存储且涉及当前键、旧键或完整清空操作。
 */
export function isThemeStorageEvent(
  event: StorageEvent,
  storageKey: string = THEME_STORAGE_KEY
): boolean {
  const storage = getThemeStorage()

  if (storage === null || event.storageArea !== storage) {
    return false
  }

  return (
    event.key === null ||
    event.key === storageKey ||
    (storageKey === THEME_STORAGE_KEY && event.key === LEGACY_THEME_STORAGE_KEY)
  )
}

/**
 * 读取并校验主题配置，默认键缺失时兼容迁移合法旧值。
 *
 * @param storageKey - 当前主题配置的存储键；自定义键不执行品牌旧键迁移。
 * @param fallback - 存储不可用、缺失或损坏时使用的完整配置。
 * @param storage - 可注入的存储边界，默认使用浏览器本地存储。
 * @returns 引用独立、可以安全交给 React State 的主题配置。
 */
export function readStoredThemeConfig(
  storageKey: string = THEME_STORAGE_KEY,
  fallback: ThemeConfig = DEFAULT_THEME_CONFIG,
  storage: ThemeStorage | null = getThemeStorage()
): ThemeConfig {
  if (!storage) {
    return cloneThemeConfig(fallback)
  }

  try {
    const currentConfig = parseStoredThemeConfig(
      storage.getItem(storageKey),
      fallback
    )

    if (currentConfig) {
      return currentConfig
    }

    if (storageKey !== THEME_STORAGE_KEY) {
      return cloneThemeConfig(fallback)
    }

    const legacyConfig = parseStoredThemeConfig(
      storage.getItem(LEGACY_THEME_STORAGE_KEY),
      fallback
    )

    if (!legacyConfig) {
      return cloneThemeConfig(fallback)
    }

    try {
      storage.setItem(THEME_STORAGE_KEY, serializeThemeConfig(legacyConfig))
      storage.removeItem(LEGACY_THEME_STORAGE_KEY)
    } catch {
      // 迁移写入失败时继续采用合法旧值，并保留旧键供下次启动重试。
    }

    return legacyConfig
  } catch {
    // 权限拒绝或存储实现异常不得阻止应用启动。
    return cloneThemeConfig(fallback)
  }
}

/**
 * 保存完整主题配置，并在默认键写入成功后移除旧品牌键。
 *
 * @param config - 已通过主题配置边界校验的完整配置。
 * @param storageKey - ThemeProvider 当前使用的存储键。
 * @param storage - 可注入的存储边界，默认使用浏览器本地存储。
 */
export function writeStoredThemeConfig(
  config: ThemeConfig,
  storageKey: string = THEME_STORAGE_KEY,
  storage: ThemeStorage | null = getThemeStorage()
): void {
  if (!storage) {
    return
  }

  try {
    storage.setItem(storageKey, serializeThemeConfig(config))

    if (storageKey === THEME_STORAGE_KEY) {
      storage.removeItem(LEGACY_THEME_STORAGE_KEY)
    }
  } catch {
    // 持久化失败不影响本次会话已经生效的内存主题状态。
  }
}

/**
 * 清除当前主题配置，并在使用默认键时一并清除旧品牌键。
 *
 * @param storageKey - ThemeProvider 当前使用的存储键。
 * @param storage - 可注入的存储边界，默认使用浏览器本地存储。
 */
export function removeStoredThemeConfig(
  storageKey: string = THEME_STORAGE_KEY,
  storage: ThemeStorage | null = getThemeStorage()
): void {
  if (!storage) {
    return
  }

  try {
    storage.removeItem(storageKey)

    if (storageKey === THEME_STORAGE_KEY) {
      storage.removeItem(LEGACY_THEME_STORAGE_KEY)
    }
  } catch {
    // 存储不可用时，调用方仍会恢复当前会话的默认内存配置。
  }
}
