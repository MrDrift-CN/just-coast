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

/** 浅色和深色主题共用的品牌主色。 */
const LIGHT_PRIMARY = "oklch(0.7487 0.2019 149.77)"

/** 品牌主色背景上使用的前景色。 */
const PRIMARY_FOREGROUND = "oklch(0.18 0.035 150)"

/** 应用正文与标题默认使用的字体栈。 */
const DEFAULT_BODY_FONT = "'Geist Variable', sans-serif"

/** 代码和等宽内容默认使用的跨平台字体栈。 */
const DEFAULT_MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"

/** 浅色和深色主题共用的装饰渐变默认值。 */
const DEFAULT_GRADIENT = {
  start: "color-mix(in oklab, var(--background) 88%, var(--primary))",
  middle: "color-mix(in oklab, var(--background) 90%, var(--accent))",
  end: "color-mix(in oklab, var(--background) 84%, var(--secondary))",
  glow: "color-mix(in oklab, var(--primary) 62%, transparent)",
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
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.145 0 0)",
      primary: LIGHT_PRIMARY,
      primaryForeground: PRIMARY_FOREGROUND,
      secondary: "oklch(0.97 0 0)",
      secondaryForeground: "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      mutedForeground: "oklch(0.556 0 0)",
      accent: "oklch(0.97 0 0)",
      accentForeground: "oklch(0.205 0 0)",
      destructive: "oklch(0.577 0.245 27.325)",
      destructiveForeground: "oklch(0.985 0 0)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: LIGHT_PRIMARY,
      gradient: { ...DEFAULT_GRADIENT },
      charts: {
        chart1: "oklch(0.87 0 0)",
        chart2: "oklch(0.556 0 0)",
        chart3: "oklch(0.439 0 0)",
        chart4: "oklch(0.371 0 0)",
        chart5: "oklch(0.269 0 0)",
      },
      sidebar: {
        background: "oklch(0.985 0 0)",
        foreground: "oklch(0.145 0 0)",
        primary: LIGHT_PRIMARY,
        primaryForeground: PRIMARY_FOREGROUND,
        accent: "oklch(0.97 0 0)",
        accentForeground: "oklch(0.205 0 0)",
        border: "oklch(0.922 0 0)",
        ring: "oklch(0.708 0 0)",
      },
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      cardForeground: "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      popoverForeground: "oklch(0.985 0 0)",
      primary: LIGHT_PRIMARY,
      primaryForeground: PRIMARY_FOREGROUND,
      secondary: "oklch(0.269 0 0)",
      secondaryForeground: "oklch(0.985 0 0)",
      muted: "oklch(0.269 0 0)",
      mutedForeground: "oklch(0.708 0 0)",
      accent: "oklch(0.269 0 0)",
      accentForeground: "oklch(0.985 0 0)",
      destructive: "oklch(0.704 0.191 22.216)",
      destructiveForeground: "oklch(0.985 0 0)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: LIGHT_PRIMARY,
      gradient: { ...DEFAULT_GRADIENT },
      charts: {
        chart1: "oklch(0.87 0 0)",
        chart2: "oklch(0.556 0 0)",
        chart3: "oklch(0.439 0 0)",
        chart4: "oklch(0.371 0 0)",
        chart5: "oklch(0.269 0 0)",
      },
      sidebar: {
        background: "oklch(0.205 0 0)",
        foreground: "oklch(0.985 0 0)",
        primary: LIGHT_PRIMARY,
        primaryForeground: PRIMARY_FOREGROUND,
        accent: "oklch(0.269 0 0)",
        accentForeground: "oklch(0.985 0 0)",
        border: "oklch(1 0 0 / 10%)",
        ring: "oklch(0.556 0 0)",
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
