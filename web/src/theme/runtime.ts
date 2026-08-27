import {
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEY,
  cloneThemeConfig,
  normalizeThemeConfig,
  parseThemeConfig,
  serializeThemeConfig,
} from "@/theme/config"
import type {
  MotionPreference,
  ResolvedMotionPreference,
  ResolvedThemeMode,
  ThemeConfig,
  ThemeMode,
  ThemePalette,
} from "@/theme/types"

/** 系统深色模式媒体查询。 */
export const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"

/** 系统减少动效媒体查询。 */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

type MainPaletteKey = keyof Omit<
  ThemePalette,
  "gradient" | "charts" | "sidebar"
>

const PALETTE_PROPERTIES = [
  ["--background", "background"],
  ["--foreground", "foreground"],
  ["--card", "card"],
  ["--card-foreground", "cardForeground"],
  ["--popover", "popover"],
  ["--popover-foreground", "popoverForeground"],
  ["--primary", "primary"],
  ["--primary-foreground", "primaryForeground"],
  ["--secondary", "secondary"],
  ["--secondary-foreground", "secondaryForeground"],
  ["--muted", "muted"],
  ["--muted-foreground", "mutedForeground"],
  ["--accent", "accent"],
  ["--accent-foreground", "accentForeground"],
  ["--destructive", "destructive"],
  ["--destructive-foreground", "destructiveForeground"],
  ["--border", "border"],
  ["--input", "input"],
  ["--ring", "ring"],
] as const satisfies readonly (readonly [string, MainPaletteKey])[]

const CHART_PROPERTIES = [
  ["--chart-1", "chart1"],
  ["--chart-2", "chart2"],
  ["--chart-3", "chart3"],
  ["--chart-4", "chart4"],
  ["--chart-5", "chart5"],
] as const satisfies readonly (readonly [
  string,
  keyof ThemePalette["charts"],
])[]

const GRADIENT_PROPERTIES = [
  ["--gradient-start", "start"],
  ["--gradient-middle", "middle"],
  ["--gradient-end", "end"],
  ["--gradient-glow", "glow"],
] as const satisfies readonly (readonly [
  string,
  keyof ThemePalette["gradient"],
])[]

const SIDEBAR_PROPERTIES = [
  ["--sidebar", "background"],
  ["--sidebar-foreground", "foreground"],
  ["--sidebar-primary", "primary"],
  ["--sidebar-primary-foreground", "primaryForeground"],
  ["--sidebar-accent", "accent"],
  ["--sidebar-accent-foreground", "accentForeground"],
  ["--sidebar-border", "border"],
  ["--sidebar-ring", "ring"],
] as const satisfies readonly (readonly [
  string,
  keyof ThemePalette["sidebar"],
])[]

function canUseDom() {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

function supportsCssValue(property: string, value: string) {
  return (
    typeof CSS === "undefined" ||
    typeof CSS.supports !== "function" ||
    CSS.supports(property, value)
  )
}

function setSupportedProperty(
  root: HTMLElement,
  property: string,
  cssProperty: string,
  value: string,
  fallback: string
) {
  root.style.setProperty(
    property,
    supportsCssValue(cssProperty, value) ? value : fallback
  )
}

function applyPalette(
  root: HTMLElement,
  palette: ThemePalette,
  fallback: ThemePalette
) {
  for (const [property, key] of PALETTE_PROPERTIES) {
    setSupportedProperty(root, property, "color", palette[key], fallback[key])
  }

  for (const [property, key] of CHART_PROPERTIES) {
    setSupportedProperty(
      root,
      property,
      "color",
      palette.charts[key],
      fallback.charts[key]
    )
  }

  for (const [property, key] of GRADIENT_PROPERTIES) {
    setSupportedProperty(
      root,
      property,
      "color",
      palette.gradient[key],
      fallback.gradient[key]
    )
  }

  for (const [property, key] of SIDEBAR_PROPERTIES) {
    setSupportedProperty(
      root,
      property,
      "color",
      palette.sidebar[key],
      fallback.sidebar[key]
    )
  }
}

/** 将主题模式解析为实际使用的浅色或深色模式。 */
export function resolveThemeMode(
  mode: ThemeMode,
  systemDark = canUseDom() && window.matchMedia(COLOR_SCHEME_QUERY).matches
): ResolvedThemeMode {
  if (mode !== "system") return mode
  return systemDark ? "dark" : "light"
}

/** 将动效偏好解析为实际使用的模式。 */
export function resolveMotionPreference(
  preference: MotionPreference,
  systemReduced = canUseDom() && window.matchMedia(REDUCED_MOTION_QUERY).matches
): ResolvedMotionPreference {
  if (preference !== "system") return preference
  return systemReduced ? "reduce" : "full"
}

/** 从浏览器存储读取主题配置。 */
export function loadThemeConfig(
  storageKey = THEME_STORAGE_KEY,
  fallback: ThemeConfig = DEFAULT_THEME_CONFIG
): ThemeConfig {
  if (!canUseDom()) return cloneThemeConfig(fallback)

  try {
    const stored = window.localStorage.getItem(storageKey)
    if (stored) return parseThemeConfig(stored, fallback)
    return cloneThemeConfig(fallback)
  } catch {
    return cloneThemeConfig(fallback)
  }
}

/** 将完整主题配置保存到浏览器。 */
export function saveThemeConfig(
  config: ThemeConfig,
  storageKey = THEME_STORAGE_KEY
) {
  if (!canUseDom()) return

  try {
    window.localStorage.setItem(storageKey, serializeThemeConfig(config))
  } catch {
    // 隐私模式或存储空间不足时，当前会话仍可继续使用内存中的配置。
  }
}

/** 清除浏览器中保存的主题配置。 */
export function clearStoredTheme(storageKey = THEME_STORAGE_KEY) {
  if (!canUseDom()) return

  try {
    window.localStorage.removeItem(storageKey)
  } catch {
    // 存储不可用时无需阻止主题恢复默认值。
  }
}

/**
 * 将主题配置同步到根元素和 shadcn 语义 CSS 变量。
 *
 * @returns 本次实际生效的主题和动效模式。
 */
export function applyThemeConfig(
  config: ThemeConfig,
  root = canUseDom() ? document.documentElement : undefined
): {
  resolvedTheme: ResolvedThemeMode
  resolvedMotion: ResolvedMotionPreference
} {
  const normalized = normalizeThemeConfig(config)
  const resolvedTheme = resolveThemeMode(normalized.mode)
  const resolvedMotion = resolveMotionPreference(normalized.effects.motion)

  if (!root) return { resolvedTheme, resolvedMotion }

  root.classList.remove("light", "dark")
  root.classList.add(resolvedTheme)
  root.style.colorScheme = resolvedTheme

  root.dataset.theme = resolvedTheme
  root.dataset.themeMode = normalized.mode
  root.dataset.motion = resolvedMotion
  root.dataset.sidebar = normalized.effects.translucentSidebar
    ? "translucent"
    : "solid"
  root.dataset.pointer = normalized.preferences.pointerCursor
    ? "pointer"
    : "default"
  root.dataset.diffMarker = normalized.preferences.diffMarker

  applyPalette(
    root,
    normalized.palettes[resolvedTheme],
    DEFAULT_THEME_CONFIG.palettes[resolvedTheme]
  )
  setSupportedProperty(
    root,
    "--theme-font-body",
    "font-family",
    normalized.typography.bodyFontFamily,
    DEFAULT_THEME_CONFIG.typography.bodyFontFamily
  )
  setSupportedProperty(
    root,
    "--theme-font-heading",
    "font-family",
    normalized.typography.headingFontFamily,
    DEFAULT_THEME_CONFIG.typography.headingFontFamily
  )
  setSupportedProperty(
    root,
    "--theme-font-mono",
    "font-family",
    normalized.typography.monoFontFamily,
    DEFAULT_THEME_CONFIG.typography.monoFontFamily
  )
  root.style.setProperty(
    "--theme-font-size",
    `${normalized.typography.fontSize}px`
  )
  root.style.setProperty(
    "--theme-font-weight",
    String(normalized.typography.bodyFontWeight)
  )
  root.style.setProperty("--radius", `${normalized.shape.radius}rem`)
  root.style.setProperty(
    "--theme-contrast-scale",
    String(0.75 + normalized.preferences.contrast * 0.005)
  )

  return { resolvedTheme, resolvedMotion }
}

/** 在 React 挂载前恢复并应用主题，避免首屏主题闪烁。 */
export function initializeTheme(
  storageKey = THEME_STORAGE_KEY,
  fallback: ThemeConfig = DEFAULT_THEME_CONFIG
): ThemeConfig {
  const config = loadThemeConfig(storageKey, fallback)
  applyThemeConfig(config)
  return config
}
