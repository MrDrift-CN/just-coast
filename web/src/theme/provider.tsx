/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import {
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEY,
  cloneThemeConfig,
  mergeThemeConfig,
  normalizeThemeConfig,
  parseThemeConfig,
  serializeThemeConfig,
} from "./config"
import {
  COLOR_SCHEME_QUERY,
  REDUCED_MOTION_QUERY,
  applyThemeConfig,
  clearStoredTheme,
  loadThemeConfig,
  resolveMotionPreference,
  resolveThemeMode,
  saveThemeConfig,
} from "./runtime"
import type {
  ResolvedMotionPreference,
  ResolvedThemeMode,
  ThemeConfig,
  ThemeConfigPatch,
  ThemeMode,
} from "./types"

/**
 * 主题上下文向应用公开的能力。
 *
 * @public
 * @since 1.0.0
 */
export interface ThemeContextValue {
  config: ThemeConfig
  theme: ThemeMode
  resolvedTheme: ResolvedThemeMode
  resolvedMotion: ResolvedMotionPreference
  setTheme: (theme: ThemeMode) => void
  updateConfig: (patch: ThemeConfigPatch) => void
  resetTheme: () => void
  importTheme: (serialized: string) => ThemeConfig
  exportTheme: () => string
}

/**
 * 主题提供器属性。
 *
 * @public
 * @since 1.0.0
 */
export interface ThemeProviderProps {
  children: React.ReactNode
  defaultConfig?: ThemeConfig
  defaultTheme?: ThemeMode
  storageKey?: string
  disableTransitionOnChange?: boolean
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
)

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']")
  )
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.textContent =
    "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
  document.head.appendChild(style)
  window.getComputedStyle(document.body)
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
}

/**
 * 为应用提供统一、可持久化的主题配置。
 *
 * @remarks
 * 提供器兼容原有的 `theme` 与 `setTheme` API，同时公开完整配置、
 * 导入导出、重置和运行时解析结果。界面组件不应直接操作根元素或
 * `localStorage`。
 *
 * @param props - 主题提供器属性。
 * @returns 主题上下文提供器。
 *
 * @public
 * @since 1.0.0
 */
export function ThemeProvider({
  children,
  defaultConfig = DEFAULT_THEME_CONFIG,
  defaultTheme,
  storageKey = THEME_STORAGE_KEY,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const fallbackConfig = React.useMemo(
    () =>
      normalizeThemeConfig(
        defaultTheme ? { ...defaultConfig, mode: defaultTheme } : defaultConfig
      ),
    [defaultConfig, defaultTheme]
  )
  const [config, setConfig] = React.useState<ThemeConfig>(() =>
    loadThemeConfig(storageKey, fallbackConfig)
  )
  const [systemRevision, refreshSystemPreferences] = React.useReducer(
    (revision: number) => revision + 1,
    0
  )

  const commitConfig = React.useCallback(
    (createNext: (current: ThemeConfig) => ThemeConfig) => {
      setConfig((current) => {
        const next = normalizeThemeConfig(createNext(current), fallbackConfig)
        saveThemeConfig(next, storageKey)
        return next
      })
    },
    [fallbackConfig, storageKey]
  )

  const setTheme = React.useCallback(
    (theme: ThemeMode) => {
      commitConfig((current) => mergeThemeConfig(current, { mode: theme }))
    },
    [commitConfig]
  )

  const updateConfig = React.useCallback(
    (patch: ThemeConfigPatch) => {
      commitConfig((current) => mergeThemeConfig(current, patch))
    },
    [commitConfig]
  )

  const resetTheme = React.useCallback(() => {
    clearStoredTheme(storageKey)
    setConfig(cloneThemeConfig(fallbackConfig))
  }, [fallbackConfig, storageKey])

  const importTheme = React.useCallback(
    (serialized: string) => {
      const imported = parseThemeConfig(serialized, fallbackConfig)
      saveThemeConfig(imported, storageKey)
      setConfig(imported)
      return imported
    },
    [fallbackConfig, storageKey]
  )

  const exportTheme = React.useCallback(
    () => serializeThemeConfig(config),
    [config]
  )

  const resolvedTheme = React.useMemo(
    () => resolveThemeMode(config.mode),
    // 系统主题变化时需要重新解析 system。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.mode, systemRevision]
  )
  const resolvedMotion = React.useMemo(
    () => resolveMotionPreference(config.effects.motion),
    // 系统动效偏好变化时需要重新解析 system。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.effects.motion, systemRevision]
  )

  React.useLayoutEffect(() => {
    if (disableTransitionOnChange) disableTransitionsTemporarily()
    applyThemeConfig(config)
  }, [config, disableTransitionOnChange, systemRevision])

  React.useEffect(() => {
    const colorScheme = window.matchMedia(COLOR_SCHEME_QUERY)
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
    const handleSystemChange = () => refreshSystemPreferences()

    colorScheme.addEventListener("change", handleSystemChange)
    reducedMotion.addEventListener("change", handleSystemChange)

    return () => {
      colorScheme.removeEventListener("change", handleSystemChange)
      reducedMotion.removeEventListener("change", handleSystemChange)
    }
  }, [])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.storageArea !== window.localStorage ||
        event.key !== storageKey
      ) {
        return
      }

      if (event.newValue === null) {
        setConfig(cloneThemeConfig(fallbackConfig))
        return
      }

      try {
        setConfig(parseThemeConfig(event.newValue, fallbackConfig))
      } catch {
        // 忽略其他标签页写入的无效主题数据。
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [fallbackConfig, storageKey])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key.toLowerCase() !== "d" ||
        isEditableTarget(event.target)
      ) {
        return
      }

      setTheme(resolveThemeMode(config.mode) === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [config.mode, setTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      config,
      theme: config.mode,
      resolvedTheme,
      resolvedMotion,
      setTheme,
      updateConfig,
      resetTheme,
      importTheme,
      exportTheme,
    }),
    [
      config,
      exportTheme,
      importTheme,
      resetTheme,
      resolvedMotion,
      resolvedTheme,
      setTheme,
      updateConfig,
    ]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * 读取主题状态并调用主题运行时能力。
 *
 * @returns 当前主题上下文。
 *
 * @throws 当组件未位于 `ThemeProvider` 内部时抛出错误。
 *
 * @public
 * @since 1.0.0
 */
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme 必须在 ThemeProvider 内部使用。")
  }

  return context
}
