import * as React from "react"

import type {
  ResolvedMotionPreference,
  ResolvedThemeMode,
  ThemeConfig,
  ThemeConfigPatch,
  ThemeMode,
} from "@/theme/types"

/** 主题上下文向应用公开的读取、修改和导入导出能力。 */
export interface ThemeContextValue {
  /** 当前完整主题配置；消费方不得直接修改其嵌套字段。 */
  config: ThemeConfig

  /** 用户选择的主题模式，可能继续跟随系统。 */
  theme: ThemeMode

  /** 当前实际生效的浅色或深色模式。 */
  resolvedTheme: ResolvedThemeMode

  /** 当前实际生效的减少或完整动效模式。 */
  resolvedMotion: ResolvedMotionPreference

  /** 切换用户主题模式并持久化完整配置。 */
  setTheme: (theme: ThemeMode) => void

  /** 深层合并并持久化一份经过校验的局部主题更新。 */
  updateConfig: (patch: ThemeConfigPatch) => void

  /** 清除持久化配置并恢复 Provider 的默认主题。 */
  resetTheme: () => void

  /** 校验、应用并持久化由 `exportTheme` 生成的 JSON。 */
  importTheme: (serialized: string) => ThemeConfig

  /** 导出当前规范化主题配置，供个性化管理页面下载或复制。 */
  exportTheme: () => string
}

/** Provider 与 `useTheme` 共享的内部主题上下文。 */
export const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
)

/**
 * 读取主题状态并调用统一的主题修改能力。
 *
 * @returns 当前主题上下文；其中操作函数在依赖不变时保持引用稳定。
 * @throws {Error} 组件未位于 `ThemeProvider` 内部时抛出。
 *
 * @example
 * 在事件处理器中切换模式或更新个性化配置，禁止在渲染阶段调用修改函数。
 *
 * ```tsx
 * import { useTheme } from "@/theme"
 *
 * export const AppearanceControls = () => {
 *   const { resolvedTheme, setTheme, updateConfig } = useTheme()
 *
 *   function handleThemeToggle() {
 *     setTheme(resolvedTheme === "dark" ? "light" : "dark")
 *   }
 *
 *   function handleRadiusChange(radius: number) {
 *     updateConfig({ shape: { radius } })
 *   }
 *
 *   return (
 *     <AppearanceForm
 *       onToggle={handleThemeToggle}
 *       onRadiusChange={handleRadiusChange}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * 个性化管理页面可以通过同一 Hook 导入和导出主题配置。
 *
 * ```tsx
 * const { exportTheme, importTheme } = useTheme()
 * const serialized = exportTheme()
 * const imported = importTheme(serialized)
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme 必须在 ThemeProvider 内部使用。")
  }

  return context
}
