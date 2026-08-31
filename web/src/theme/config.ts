import type {
  DiffMarkerStyle,
  MotionPreference,
  ThemeConfig,
  ThemeConfigPatch,
  ThemeGradientPalette,
  ThemeMode,
  ThemePalette,
  ThemePalettePatch,
} from "@/theme/types"

/** 浅色和深色主题共用的高明度蓝色主操作色。 */
const PRIMARY = "#0084FF"

/** 蓝色主操作背景上使用的高对比度黑色前景。 */
const PRIMARY_FOREGROUND = "#000000"

/** 应用正文与标题默认使用的字体栈。 */
const DEFAULT_BODY_FONT = "'Geist Variable', sans-serif"

/** 代码和等宽内容默认使用的跨平台字体栈。 */
const DEFAULT_MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"

/** 浅色模式认证页与装饰背景使用的明亮蓝青渐变。 */
const LIGHT_GRADIENT = {
  start: "#20D5C4",
  middle: "#8DFFF4",
  end: "#0084FF",
  glow: "color-mix(in oklab, #20D5C4 54%, transparent)",
} as const satisfies ThemeGradientPalette

/** 深色模式装饰背景使用的蓝青渐变。 */
const DARK_GRADIENT = {
  start: "#002EB7",
  middle: "#0084FF",
  end: "#20D5C4",
  glow: "color-mix(in oklab, #20D5C4 52%, transparent)",
} as const satisfies ThemeGradientPalette

/**
 * 应用的默认主题配置。
 *
 * @remarks
 * 这些值与 `styles.css` 的静态首屏变量保持一致，避免 React 挂载前后闪烁。
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: "system",
  palettes: {
    light: {
      background: "#F8FFFF",
      foreground: "#071426",
      card: "#FFFFFF",
      cardForeground: "#071426",
      popover: "#FFFFFF",
      popoverForeground: "#071426",
      primary: PRIMARY,
      primaryForeground: PRIMARY_FOREGROUND,
      secondary: "#EAFFFD",
      secondaryForeground: "#002EB7",
      muted: "#F1F7F8",
      mutedForeground: "#5A6878",
      accent: "#D6FCF8",
      accentForeground: "#002EB7",
      destructive: "#D43D50",
      destructiveForeground: "#FFFFFF",
      success: "#16834B",
      border: "#CFE5EA",
      input: "#BBD9E2",
      ring: PRIMARY,
      gradient: { ...LIGHT_GRADIENT },
      charts: {
        chart1: "#002EB7",
        chart2: "#0084FF",
        chart3: "#0AAE9F",
        chart4: "#6C63D8",
        chart5: "#D08A1E",
      },
      sidebar: {
        background: "#F7FFFF",
        foreground: "#071426",
        primary: PRIMARY,
        primaryForeground: PRIMARY_FOREGROUND,
        accent: "#D6FCF8",
        accentForeground: "#002EB7",
        border: "#CFE5EA",
        ring: PRIMARY,
      },
    },
    dark: {
      background: "#07111F",
      foreground: "#EAF6FF",
      card: "#0C1B2D",
      cardForeground: "#EAF6FF",
      popover: "#0F2238",
      popoverForeground: "#EAF6FF",
      primary: PRIMARY,
      primaryForeground: PRIMARY_FOREGROUND,
      secondary: "#13283E",
      secondaryForeground: "#DCEBFA",
      muted: "#102236",
      mutedForeground: "#9AAFC3",
      accent: "#0B3D46",
      accentForeground: "#8DFFF4",
      destructive: "#FF6B78",
      destructiveForeground: "#2B080D",
      success: "#42D680",
      border: "#20364D",
      input: "#29445F",
      ring: "#20D5C4",
      gradient: { ...DARK_GRADIENT },
      charts: {
        chart1: "#5AAEFF",
        chart2: "#20D5C4",
        chart3: "#8DFFF4",
        chart4: "#9B8CFF",
        chart5: "#FFC565",
      },
      sidebar: {
        background: "#091A2B",
        foreground: "#EAF6FF",
        primary: PRIMARY,
        primaryForeground: PRIMARY_FOREGROUND,
        accent: "#12364B",
        accentForeground: "#8DFFF4",
        border: "#20364D",
        ring: "#20D5C4",
      },
    },
  },
  typography: {
    bodyFontFamily: DEFAULT_BODY_FONT,
    headingFontFamily: DEFAULT_BODY_FONT,
    monoFontFamily: DEFAULT_MONO_FONT,
    fontSize: 16,
    bodyFontWeight: 400,
  },
  shape: {
    radius: 0.625,
  },
  effects: {
    translucentSidebar: false,
    motion: "system",
  },
  preferences: {
    contrast: 50,
    pointerCursor: false,
    diffMarker: "color",
  },
}

/** 主题模式的运行时白名单。 */
const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"]

/** 动效偏好的运行时白名单。 */
const MOTION_PREFERENCES: readonly MotionPreference[] = [
  "system",
  "reduce",
  "full",
]

/** 差异标记样式的运行时白名单。 */
const DIFF_MARKER_STYLES: readonly DiffMarkerStyle[] = ["color", "sign"]

/** 主语义色板允许从不可信数据读取的字段。 */
const PALETTE_KEYS = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "destructiveForeground",
  "success",
  "border",
  "input",
  "ring",
] as const

/** 图表色板允许从不可信数据读取的字段。 */
const CHART_KEYS = ["chart1", "chart2", "chart3", "chart4", "chart5"] as const

/** 装饰渐变允许从不可信数据读取的字段。 */
const GRADIENT_KEYS = ["start", "middle", "end", "glow"] as const

/** 侧边栏色板允许从不可信数据读取的字段。 */
const SIDEBAR_KEYS = [
  "background",
  "foreground",
  "primary",
  "primaryForeground",
  "accent",
  "accentForeground",
  "border",
  "ring",
] as const

/** 判断未知输入是否为可以按字段读取的普通对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** 判断未知输入是否为长度受限且不能注入额外 CSS 声明的值。 */
function isSafeCssValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= 256 &&
    !/[;{}<>]/u.test(value)
  )
}

/** 将有限数值约束到允许范围，无效输入回退到既有值。 */
function normalizeNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback
  return Math.min(maximum, Math.max(minimum, value))
}

/** 从运行时白名单中选择字符串，无效输入回退到既有值。 */
function normalizeChoice<T extends string>(
  value: unknown,
  choices: readonly T[],
  fallback: T
): T {
  if (typeof value !== "string" || !choices.includes(value as T))
    return fallback
  return value as T
}

/** 将一个白名单字段转换为规范化 CSS 键值对。 */
function normalizeCssEntry<T extends object>(
  source: Record<string, unknown>,
  fallback: T,
  key: keyof T
): [keyof T, string] {
  const candidate = source[String(key)]
  return [
    key,
    isSafeCssValue(candidate) ? candidate.trim() : String(fallback[key]),
  ]
}

/** 按显式字段白名单规范化一组 CSS 值。 */
function normalizeCssValues<T extends object>(
  value: unknown,
  fallback: T,
  keys: readonly (keyof T)[]
): T {
  const source = isRecord(value) ? value : {}
  return Object.fromEntries(
    keys.map((key) => normalizeCssEntry(source, fallback, key))
  ) as T
}

/** 将未知色板补全并约束为一套可安全应用的语义色板。 */
function normalizePalette(
  value: unknown,
  fallback: ThemePalette
): ThemePalette {
  const source = isRecord(value) ? value : {}
  return {
    ...normalizeCssValues(value, fallback, PALETTE_KEYS),
    gradient: normalizeCssValues(
      source.gradient,
      fallback.gradient,
      GRADIENT_KEYS
    ),
    charts: normalizeCssValues(source.charts, fallback.charts, CHART_KEYS),
    sidebar: normalizeCssValues(source.sidebar, fallback.sidebar, SIDEBAR_KEYS),
  }
}

/** 深复制一套包含嵌套对象的主题色板。 */
function clonePalette(palette: ThemePalette): ThemePalette {
  return {
    ...palette,
    gradient: { ...palette.gradient },
    charts: { ...palette.charts },
    sidebar: { ...palette.sidebar },
  }
}

/** 深层合并一套局部色板更新。 */
function mergePalette(
  current: ThemePalette,
  patch?: ThemePalettePatch
): ThemePalette {
  return {
    ...current,
    ...patch,
    gradient: {
      ...current.gradient,
      ...patch?.gradient,
    },
    charts: {
      ...current.charts,
      ...patch?.charts,
    },
    sidebar: {
      ...current.sidebar,
      ...patch?.sidebar,
    },
  }
}

/** 复制一份可安全修改、引用完全独立的主题配置。 */
export function cloneThemeConfig(config: ThemeConfig): ThemeConfig {
  return {
    ...config,
    palettes: {
      light: clonePalette(config.palettes.light),
      dark: clonePalette(config.palettes.dark),
    },
    typography: { ...config.typography },
    shape: { ...config.shape },
    effects: { ...config.effects },
    preferences: { ...config.preferences },
  }
}

/** 将存储、导入文件或接口取得的未知数据规范化为完整主题配置。 */
export function normalizeThemeConfig(
  value: unknown,
  fallback: ThemeConfig = DEFAULT_THEME_CONFIG
): ThemeConfig {
  const candidate = isRecord(value) ? value : {}
  const palettes = isRecord(candidate.palettes) ? candidate.palettes : {}
  const typography = isRecord(candidate.typography) ? candidate.typography : {}
  const shape = isRecord(candidate.shape) ? candidate.shape : {}
  const effects = isRecord(candidate.effects) ? candidate.effects : {}
  const preferences = isRecord(candidate.preferences)
    ? candidate.preferences
    : {}

  return {
    mode: normalizeChoice(candidate.mode, THEME_MODES, fallback.mode),
    palettes: {
      light: normalizePalette(palettes.light, fallback.palettes.light),
      dark: normalizePalette(palettes.dark, fallback.palettes.dark),
    },
    typography: {
      bodyFontFamily: isSafeCssValue(typography.bodyFontFamily)
        ? typography.bodyFontFamily.trim()
        : fallback.typography.bodyFontFamily,
      headingFontFamily: isSafeCssValue(typography.headingFontFamily)
        ? typography.headingFontFamily.trim()
        : fallback.typography.headingFontFamily,
      monoFontFamily: isSafeCssValue(typography.monoFontFamily)
        ? typography.monoFontFamily.trim()
        : fallback.typography.monoFontFamily,
      fontSize: normalizeNumber(
        typography.fontSize,
        fallback.typography.fontSize,
        12,
        24
      ),
      bodyFontWeight: normalizeNumber(
        typography.bodyFontWeight,
        fallback.typography.bodyFontWeight,
        100,
        900
      ),
    },
    shape: {
      radius: normalizeNumber(shape.radius, fallback.shape.radius, 0, 2),
    },
    effects: {
      translucentSidebar:
        typeof effects.translucentSidebar === "boolean"
          ? effects.translucentSidebar
          : fallback.effects.translucentSidebar,
      motion: normalizeChoice(
        effects.motion,
        MOTION_PREFERENCES,
        fallback.effects.motion
      ),
    },
    preferences: {
      contrast: normalizeNumber(
        preferences.contrast,
        fallback.preferences.contrast,
        0,
        100
      ),
      pointerCursor:
        typeof preferences.pointerCursor === "boolean"
          ? preferences.pointerCursor
          : fallback.preferences.pointerCursor,
      diffMarker: normalizeChoice(
        preferences.diffMarker,
        DIFF_MARKER_STYLES,
        fallback.preferences.diffMarker
      ),
    },
  }
}

/** 将局部主题更新深层合并到完整配置并重新校验。 */
export function mergeThemeConfig(
  current: ThemeConfig,
  patch: ThemeConfigPatch
): ThemeConfig {
  return normalizeThemeConfig(
    {
      ...current,
      ...patch,
      palettes: {
        light: mergePalette(current.palettes.light, patch.palettes?.light),
        dark: mergePalette(current.palettes.dark, patch.palettes?.dark),
      },
      typography: {
        ...current.typography,
        ...patch.typography,
      },
      shape: {
        ...current.shape,
        ...patch.shape,
      },
      effects: {
        ...current.effects,
        ...patch.effects,
      },
      preferences: {
        ...current.preferences,
        ...patch.preferences,
      },
    },
    current
  )
}

/** 解析并校验 JSON 格式的主题配置。 */
export function parseThemeConfig(
  serialized: string,
  fallback: ThemeConfig = DEFAULT_THEME_CONFIG
): ThemeConfig {
  const value: unknown = JSON.parse(serialized)
  if (!isRecord(value)) {
    throw new TypeError("主题配置必须是一个 JSON 对象。")
  }
  return normalizeThemeConfig(value, fallback)
}

/** 将主题配置序列化为便于导出的 JSON。 */
export function serializeThemeConfig(config: ThemeConfig): string {
  return JSON.stringify(normalizeThemeConfig(config), null, 2)
}
