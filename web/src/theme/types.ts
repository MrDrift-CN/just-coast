/** 可供用户选择的主题模式。 */
export type ThemeMode =
  | /** 始终使用浅色主题。 */ "light"
  | /** 始终使用深色主题。 */ "dark"
  | /** 跟随操作系统配色偏好。 */ "system"

/** 已解析为当前实际配色的主题模式。 */
export type ResolvedThemeMode = Exclude<ThemeMode, "system">

/** 用户对界面动效的偏好。 */
export type MotionPreference =
  | /** 跟随操作系统减少动效偏好。 */ "system"
  | /** 尽可能减少非必要动画和过渡。 */ "reduce"
  | /** 使用完整动画和过渡。 */ "full"

/** 已解析为当前实际行为的动效偏好。 */
export type ResolvedMotionPreference = Exclude<MotionPreference, "system">

/** 差异内容的视觉标记方式。 */
export type DiffMarkerStyle =
  | /** 通过语义颜色区分差异。 */ "color"
  | /** 通过正负号等字符区分差异。 */ "sign"

/** 图表序列使用的五级语义颜色。 */
export interface ThemeChartPalette {
  /** 第一组或最主要的数据序列颜色。 */
  chart1: string

  /** 第二组数据序列颜色。 */
  chart2: string

  /** 第三组数据序列颜色。 */
  chart3: string

  /** 第四组数据序列颜色。 */
  chart4: string

  /** 第五组数据序列颜色。 */
  chart5: string
}

/** 应用装饰性背景使用的渐变语义颜色。 */
export interface ThemeGradientPalette {
  /** 渐变起点颜色。 */
  start: string

  /** 渐变中段颜色。 */
  middle: string

  /** 渐变终点颜色。 */
  end: string

  /** 渐变周围装饰光晕的颜色。 */
  glow: string
}

/** 侧边栏独立使用的语义颜色。 */
export interface ThemeSidebarPalette {
  /** 侧边栏基础背景色。 */
  background: string

  /** 侧边栏默认文本和图标颜色。 */
  foreground: string

  /** 侧边栏主要操作或选中项背景色。 */
  primary: string

  /** 侧边栏主要色背景上的内容颜色。 */
  primaryForeground: string

  /** 侧边栏悬浮或次要强调背景色。 */
  accent: string

  /** 侧边栏强调色背景上的内容颜色。 */
  accentForeground: string

  /** 侧边栏边界和分隔线颜色。 */
  border: string

  /** 侧边栏焦点环颜色。 */
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
  /** 页面和大面积容器的基础背景色。 */
  background: string

  /** 基础背景上的默认文本和图标颜色。 */
  foreground: string

  /** 卡片容器背景色。 */
  card: string

  /** 卡片背景上的文本和图标颜色。 */
  cardForeground: string

  /** 弹层、菜单和浮层背景色。 */
  popover: string

  /** 弹层背景上的文本和图标颜色。 */
  popoverForeground: string

  /** 主要操作、品牌元素和选中状态颜色。 */
  primary: string

  /** 主要色背景上的内容颜色。 */
  primaryForeground: string

  /** 次要操作和弱层级容器背景色。 */
  secondary: string

  /** 次要色背景上的内容颜色。 */
  secondaryForeground: string

  /** 禁用、占位和弱强调区域背景色。 */
  muted: string

  /** 弱强调区域上的说明文本颜色。 */
  mutedForeground: string

  /** 悬浮、选中或局部强调区域背景色。 */
  accent: string

  /** 强调色背景上的内容颜色。 */
  accentForeground: string

  /** 删除、失败和危险操作颜色。 */
  destructive: string

  /** 危险色背景上的内容颜色。 */
  destructiveForeground: string

  /** 成功、完成和已生效状态颜色。 */
  success: string

  /** 容器边界和分隔线颜色。 */
  border: string

  /** 输入控件边界或底色。 */
  input: string

  /** 键盘焦点环颜色。 */
  ring: string

  /** 装饰性背景和光晕使用的渐变色板。 */
  gradient: ThemeGradientPalette

  /** 图表数据序列使用的色板。 */
  charts: ThemeChartPalette

  /** 侧边栏独立使用的色板。 */
  sidebar: ThemeSidebarPalette
}

/** 全局界面排版配置。字体必须先由应用加载，配置中仅保存 CSS 字体族。 */
export interface ThemeTypography {
  /** 正文、表单和普通控件使用的 CSS 字体族。 */
  bodyFontFamily: string

  /** 标题和强调文本使用的 CSS 字体族。 */
  headingFontFamily: string

  /** 代码、日志和等宽内容使用的 CSS 字体族。 */
  monoFontFamily: string

  /** 根级正文基准字号，单位为 px。 */
  fontSize: number

  /** 正文默认字重，范围为 100 至 900。 */
  bodyFontWeight: number
}

/** 全局形状配置。 */
export interface ThemeShape {
  /** shadcn 基础圆角，单位为 rem。 */
  radius: number
}

/** 全局视觉效果配置。 */
export interface ThemeEffects {
  /** 侧边栏是否使用带背景模糊的半透明效果。 */
  translucentSidebar: boolean

  /** 界面动画和过渡的用户偏好。 */
  motion: MotionPreference
}

/** 不属于颜色令牌的界面偏好。 */
export interface ThemePreferences {
  /** 视觉对比度强度，范围为 0 至 100。 */
  contrast: number

  /** 可点击元素是否统一显示指针光标。 */
  pointerCursor: boolean

  /** 差异内容使用颜色还是字符标记。 */
  diffMarker: DiffMarkerStyle
}

/** 主题模块持久化和运行时使用的完整配置。 */
export interface ThemeConfig {
  /** 用户选择的主题模式。 */
  mode: ThemeMode

  /** 浅色和深色模式各自使用的完整语义色板。 */
  palettes: {
    /** 浅色模式语义色板。 */
    light: ThemePalette

    /** 深色模式语义色板。 */
    dark: ThemePalette
  }

  /** 全局字体、字号和字重配置。 */
  typography: ThemeTypography

  /** 全局圆角等形状配置。 */
  shape: ThemeShape

  /** 全局半透明和动效配置。 */
  effects: ThemeEffects

  /** 对比度、光标和差异标记等界面偏好。 */
  preferences: ThemePreferences
}

/** 图表色板的局部更新。 */
export type ThemeChartPalettePatch = Partial<ThemeChartPalette>

/** 装饰渐变色板的局部更新。 */
export type ThemeGradientPalettePatch = Partial<ThemeGradientPalette>

/** 侧边栏色板的局部更新。 */
export type ThemeSidebarPalettePatch = Partial<ThemeSidebarPalette>

/** 主色板与三个嵌套色板的深层局部更新。 */
export type ThemePalettePatch = Partial<
  Omit<ThemePalette, "gradient" | "charts" | "sidebar">
> & {
  /** 装饰渐变的局部更新。 */
  gradient?: ThemeGradientPalettePatch

  /** 图表颜色的局部更新。 */
  charts?: ThemeChartPalettePatch

  /** 侧边栏颜色的局部更新。 */
  sidebar?: ThemeSidebarPalettePatch
}

/** 更新主题时接受的深层可选配置。 */
export interface ThemeConfigPatch {
  /** 替换用户选择的主题模式。 */
  mode?: ThemeMode

  /** 分别更新浅色或深色语义色板。 */
  palettes?: {
    /** 浅色模式色板的局部更新。 */
    light?: ThemePalettePatch

    /** 深色模式色板的局部更新。 */
    dark?: ThemePalettePatch
  }

  /** 排版配置的局部更新。 */
  typography?: Partial<ThemeTypography>

  /** 形状配置的局部更新。 */
  shape?: Partial<ThemeShape>

  /** 视觉效果配置的局部更新。 */
  effects?: Partial<ThemeEffects>

  /** 非颜色界面偏好的局部更新。 */
  preferences?: Partial<ThemePreferences>
}
