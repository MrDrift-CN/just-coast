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

/** 主题配置的本地存储键。 */
export const THEME_STORAGE_KEY = "just-coast.theme"

const LIGHT_PRIMARY = "oklch(0.7487 0.2019 149.77)"
const PRIMARY_FOREGROUND = "oklch(0.18 0.035 150)"
const DEFAULT_BODY_FONT = "'Geist Variable', sans-serif"
const DEFAULT_MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
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

const THEME_MODES: ThemeMode[] = ["light", "dark", "system"]
const MOTION_PREFERENCES: MotionPreference[] = ["system", "reduce", "full"]
const DIFF_MARKER_STYLES: DiffMarkerStyle[] = ["color", "sign"]
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
const CHART_KEYS = ["chart1", "chart2", "chart3", "chart4", "chart5"] as const
const GRADIENT_KEYS = ["start", "middle", "end", "glow"] as const
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isSafeCssValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= 256 &&
    !/[;{}<>]/u.test(value)
  )
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback
  return Math.min(maximum, Math.max(minimum, value))
}

function normalizeChoice<T extends string>(
  value: unknown,
  choices: readonly T[],
  fallback: T
): T {
  if (typeof value !== "string" || !choices.includes(value as T))
    return fallback
  return value as T
}

function normalizeCssValues<T extends object>(
  value: unknown,
  fallback: T,
  keys: readonly (keyof T)[]
): T {
  const source = isRecord(value) ? value : {}
  return Object.fromEntries(
    keys.map((key) => {
      const candidate = source[String(key)]
      return [
        key,
        isSafeCssValue(candidate) ? candidate.trim() : String(fallback[key]),
      ]
    })
  ) as T
}

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

function clonePalette(palette: ThemePalette): ThemePalette {
  return {
    ...palette,
    gradient: { ...palette.gradient },
    charts: { ...palette.charts },
    sidebar: { ...palette.sidebar },
  }
}

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
