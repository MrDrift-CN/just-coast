/**
 * 主题基础设施的唯一公共入口。
 *
 * @remarks
 * 当前由应用入口负责初始化主题，业务组件通过 `ThemeProvider` 与 `useTheme`
 * 读取或修改主题。未来期望建立统一的个性化管理页面，通过该页面集中控制主题、
 * 排版、动效和其他界面偏好；业务代码不得绕过 Context 直接写存储或根元素。
 */
export {
  Provider as ThemeProvider,
  type ProviderProps as ThemeProviderProps,
} from "@/theme/Provider"
export { initializeTheme } from "@/theme/runtime"
export { useTheme, type ThemeContextValue } from "@/theme/useTheme"
export type {
  DiffMarkerStyle,
  MotionPreference,
  ResolvedMotionPreference,
  ResolvedThemeMode,
  ThemeConfig,
  ThemeConfigPatch,
  ThemeChartPalette,
  ThemeChartPalettePatch,
  ThemeEffects,
  ThemeGradientPalette,
  ThemeGradientPalettePatch,
  ThemeMode,
  ThemePalette,
  ThemePalettePatch,
  ThemePreferences,
  ThemeShape,
  ThemeSidebarPalette,
  ThemeSidebarPalettePatch,
  ThemeTypography,
} from "@/theme/types"
