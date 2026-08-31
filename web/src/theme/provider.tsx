import * as React from "react"

import {
  DEFAULT_THEME_CONFIG,
  cloneThemeConfig,
  mergeThemeConfig,
  normalizeThemeConfig,
  parseThemeConfig,
  serializeThemeConfig,
} from "@/theme/config"
import {
  applyThemeConfig,
  resolveMotionPreference,
  resolveThemeMode,
  subscribeToSystemPreferences,
} from "@/theme/runtime"
import {
  isThemeStorageEvent,
  readStoredThemeConfig,
  removeStoredThemeConfig,
  THEME_STORAGE_KEY,
  writeStoredThemeConfig,
} from "@/theme/storage"
import { ThemeContext, type ThemeContextValue } from "@/theme/useTheme"
import type { ThemeConfig, ThemeConfigPatch, ThemeMode } from "@/theme/types"

/** 主题 React Provider 的根级配置。 */
export interface ProviderProps {
  /** 需要共享主题状态的应用节点。 */
  children: React.ReactNode

  /** 没有合法持久化配置时使用的完整主题；Provider 生命周期内应保持稳定。 */
  defaultConfig?: ThemeConfig

  /** 覆盖默认配置中的初始模式，主要用于宿主应用预设。 */
  defaultTheme?: ThemeMode

  /** 与 `initializeTheme` 保持一致的存储键；Provider 生命周期内应保持稳定。 */
  storageKey?: string

  /** 切换配置时是否临时禁用 CSS 过渡，避免颜色切换产生闪烁。 */
  disableTransitionOnChange?: boolean
}

/** 建立跨标签页主题同步所需的数据。 */
interface StoredThemeSubscription {
  /** 没有合法持久化值时使用的完整主题。 */
  fallback: ThemeConfig

  /** 当前 Provider 使用的存储键。 */
  storageKey: string

  /** 收到有效存储变化后替换内存配置。 */
  onConfigChange: (config: ThemeConfig) => void
}

/**
 * 临时关闭全局 CSS 过渡，并在两个动画帧后恢复。
 *
 * @returns 提前卸载时移除临时样式和待执行帧任务的清理函数。
 */
function disableTransitionsTemporarily(): () => void {
  const style = document.createElement("style")
  let secondFrame: number | undefined

  style.textContent =
    "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
  document.head.appendChild(style)
  window.getComputedStyle(document.body)

  /** 移除本次主题更新插入的临时样式。 */
  function removeTemporaryStyle(): void {
    style.remove()
  }

  if (typeof window.requestAnimationFrame !== "function") {
    removeTemporaryStyle()
    return () => undefined
  }

  /** 在第二个动画帧移除临时样式，确保主题变量已经完成绘制。 */
  function scheduleStyleRemoval(): void {
    secondFrame = window.requestAnimationFrame(removeTemporaryStyle)
  }

  const firstFrame = window.requestAnimationFrame(scheduleStyleRemoval)

  /** 取消尚未完成的帧任务并立即恢复过渡。 */
  function cleanup(): void {
    if (typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(firstFrame)
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame)
    }
    removeTemporaryStyle()
  }

  return cleanup
}

/**
 * 将 React 主题状态同步到文档根元素。
 *
 * @param config - 已规范化的完整主题配置。
 * @param shouldDisableTransitions - 是否临时关闭 CSS 过渡。
 * @returns 需要在下一次同步或卸载时执行的清理函数。
 */
function synchronizeThemeDocument(
  config: ThemeConfig,
  shouldDisableTransitions: boolean
): (() => void) | undefined {
  const cleanup = shouldDisableTransitions
    ? disableTransitionsTemporarily()
    : undefined

  applyThemeConfig(config)
  return cleanup
}

/**
 * 订阅其他标签页产生的主题存储变化。
 *
 * @param subscription - 存储键、回退配置和状态替换函数。
 * @returns 对称移除存储监听的清理函数。
 */
function subscribeToStoredTheme({
  fallback,
  storageKey,
  onConfigChange,
}: StoredThemeSubscription): () => void {
  /** 读取相关存储事件产生的最新完整主题。 */
  function handleStorageChange(event: StorageEvent): void {
    if (!isThemeStorageEvent(event, storageKey)) {
      return
    }

    onConfigChange(readStoredThemeConfig(storageKey, fallback))
  }

  window.addEventListener("storage", handleStorageChange)

  /** 移除当前 Provider 建立的跨标签页监听。 */
  function unsubscribe(): void {
    window.removeEventListener("storage", handleStorageChange)
  }

  return unsubscribe
}

/**
 * 为应用提供统一、可持久化的主题配置。
 *
 * @remarks
 * 公共入口将本组件导出为 `ThemeProvider`。业务组件只通过 `useTheme` 读取或
 * 修改主题，不得直接操作根元素或本地存储。
 *
 * @param props - 根节点、默认主题和持久化行为。
 * @returns 可向后代组件提供主题上下文的 React 节点。
 *
 * @example
 * 在应用入口先恢复首屏主题，再在根组件外层挂载 Provider。
 *
 * ```tsx
 * import { createRoot } from "react-dom/client"
 * import { initializeTheme, ThemeProvider } from "@/theme"
 *
 * initializeTheme()
 * createRoot(root).render(
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 * )
 * ```
 */
export const Provider = ({
  children,
  defaultConfig = DEFAULT_THEME_CONFIG,
  defaultTheme,
  storageKey = THEME_STORAGE_KEY,
  disableTransitionOnChange = true,
}: ProviderProps): React.JSX.Element => {
  const fallbackConfig = React.useMemo(
    () =>
      normalizeThemeConfig(
        defaultTheme ? { ...defaultConfig, mode: defaultTheme } : defaultConfig
      ),
    [defaultConfig, defaultTheme]
  )
  const [config, setConfig] = React.useState<ThemeConfig>(() =>
    readStoredThemeConfig(storageKey, fallbackConfig)
  )
  const configRef = React.useRef(config)
  const [systemRevision, refreshSystemPreferences] = React.useReducer(
    (revision: number) => revision + 1,
    0
  )

  /** 同步替换供回调读取的当前配置与 React 状态。 */
  const replaceConfig = React.useCallback((next: ThemeConfig): void => {
    configRef.current = next
    setConfig(next)
  }, [])

  /** 基于最新配置计算、校验并持久化下一份完整配置。 */
  const commitConfig = React.useCallback(
    (createNext: (current: ThemeConfig) => ThemeConfig): void => {
      const next = normalizeThemeConfig(
        createNext(configRef.current),
        fallbackConfig
      )
      writeStoredThemeConfig(next, storageKey)
      replaceConfig(next)
    },
    [fallbackConfig, replaceConfig, storageKey]
  )

  /** 切换用户选择的主题模式。 */
  const setTheme = React.useCallback(
    (theme: ThemeMode): void => {
      commitConfig((current) => mergeThemeConfig(current, { mode: theme }))
    },
    [commitConfig]
  )

  /** 深层合并局部主题配置。 */
  const updateConfig = React.useCallback(
    (patch: ThemeConfigPatch): void => {
      commitConfig((current) => mergeThemeConfig(current, patch))
    },
    [commitConfig]
  )

  /** 清除持久化主题并恢复当前 Provider 的默认配置。 */
  const resetTheme = React.useCallback((): void => {
    removeStoredThemeConfig(storageKey)
    replaceConfig(cloneThemeConfig(fallbackConfig))
  }, [fallbackConfig, replaceConfig, storageKey])

  /** 导入、校验并保存一份主题 JSON。 */
  const importTheme = React.useCallback(
    (serialized: string): ThemeConfig => {
      const imported = parseThemeConfig(serialized, fallbackConfig)
      writeStoredThemeConfig(imported, storageKey)
      replaceConfig(imported)
      return imported
    },
    [fallbackConfig, replaceConfig, storageKey]
  )

  /** 导出调用瞬间的最新主题配置。 */
  const exportTheme = React.useCallback(
    (): string => serializeThemeConfig(configRef.current),
    []
  )

  const resolvedTheme = resolveThemeMode(config.mode)
  const resolvedMotion = resolveMotionPreference(config.effects.motion)

  React.useLayoutEffect(
    () => synchronizeThemeDocument(config, disableTransitionOnChange),
    [config, disableTransitionOnChange, systemRevision]
  )

  React.useEffect(
    () => subscribeToSystemPreferences(refreshSystemPreferences),
    []
  )

  React.useEffect(
    () =>
      subscribeToStoredTheme({
        fallback: fallbackConfig,
        storageKey,
        onConfigChange: replaceConfig,
      }),
    [fallbackConfig, replaceConfig, storageKey]
  )

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
