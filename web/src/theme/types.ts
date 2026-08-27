/** 可供用户选择的主题模式。 */
export type ThemeMode = "light" | "dark" | "system"

/** 已解析为具体配色的主题模式。 */
export type ResolvedThemeMode = Exclude<ThemeMode, "system">

/** 动效偏好。 */
export type MotionPreference = "system" | "reduce" | "full"

/** 已解析的动效偏好。 */
export type ResolvedMotionPreference = Exclude<MotionPreference, "system">

/** 差异内容的标记方式。 */
export type DiffMarkerStyle = "color" | "sign"

/** 图表专用语义颜色。 */
export interface ThemeChartPalette {
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
}

/** 侧边栏专用语义颜色。 */
export interface ThemeSidebarPalette {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  border: string
  ring: string
}

/**
 * 一套主题的完整语义颜色。
 *
 * @remarks
 * 字段直接映射到 shadcn 的 CSS 变量。业务组件应使用
 * `bg-primary`、`text-muted-foreground` 等语义类名，不应读取本对象或写死颜色。
 */
export interface ThemePalette {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  charts: ThemeChartPalette
  sidebar: ThemeSidebarPalette
}

/** 全局界面排版配置。字体必须先由应用加载，配置中仅保存 CSS 字体族。 */
export interface ThemeTypography {
  bodyFontFamily: string
  headingFontFamily: string
  monoFontFamily: string
  fontSize: number
  bodyFontWeight: number
}

/** 全局形状配置。 */
export interface ThemeShape {
  /** shadcn 基础圆角，单位为 rem。 */
  radius: number
}

/** 全局视觉效果配置。 */
export interface ThemeEffects {
  translucentSidebar: boolean
  motion: MotionPreference
}

/** 不属于颜色令牌的界面偏好。 */
export interface ThemePreferences {
  contrast: number
  pointerCursor: boolean
  diffMarker: DiffMarkerStyle
}

/** 主题模块持久化和运行时使用的完整配置。 */
export interface ThemeConfig {
  mode: ThemeMode
  palettes: {
    light: ThemePalette
    dark: ThemePalette
  }
  typography: ThemeTypography
  shape: ThemeShape
  effects: ThemeEffects
  preferences: ThemePreferences
}

export type ThemeChartPalettePatch = Partial<ThemeChartPalette>
export type ThemeSidebarPalettePatch = Partial<ThemeSidebarPalette>
export type ThemePalettePatch = Partial<
  Omit<ThemePalette, "charts" | "sidebar">
> & {
  charts?: ThemeChartPalettePatch
  sidebar?: ThemeSidebarPalettePatch
}

/** 更新主题时接受的深层可选配置。 */
export interface ThemeConfigPatch {
  mode?: ThemeMode
  palettes?: {
    light?: ThemePalettePatch
    dark?: ThemePalettePatch
  }
  typography?: Partial<ThemeTypography>
  shape?: Partial<ThemeShape>
  effects?: Partial<ThemeEffects>
  preferences?: Partial<ThemePreferences>
}
