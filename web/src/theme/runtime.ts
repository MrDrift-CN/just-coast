import { DEFAULT_THEME_CONFIG, normalizeThemeConfig } from "@/theme/config"
import { readStoredThemeConfig, THEME_STORAGE_KEY } from "@/theme/storage"
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

/** 不包含嵌套渐变、图表和侧栏对象的主色板字段。 */
type MainPaletteKey = keyof Omit<
  ThemePalette,
  "gradient" | "charts" | "sidebar"
>

/** 主色板字段到根元素 CSS 自定义属性的映射。 */
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

/** 图表色字段到根元素 CSS 自定义属性的映射。 */
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

/** 装饰渐变字段到根元素 CSS 自定义属性的映射。 */
const GRADIENT_PROPERTIES = [
  ["--gradient-start", "start"],
  ["--gradient-middle", "middle"],
  ["--gradient-end", "end"],
  ["--gradient-glow", "glow"],
] as const satisfies readonly (readonly [
  string,
  keyof ThemePalette["gradient"],
])[]

/** 侧边栏色板字段到根元素 CSS 自定义属性的映射。 */
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

/** 判断当前运行环境是否能够操作浏览器文档。 */
function canUseDom(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

/** 判断浏览器是否接受指定 CSS 属性值。 */
function supportsCssValue(property: string, value: string): boolean {
  return (
    typeof CSS === "undefined" ||
    typeof CSS.supports !== "function" ||
    CSS.supports(property, value)
  )
}

/**
 * 安全读取媒体查询结果。
 *
 * @param query - 需要检查的 CSS 媒体查询。
 * @returns 查询是否匹配；API 不可用或查询失败时返回 false。
 */
function matchesMediaQuery(query: string): boolean {
  if (!canUseDom() || typeof window.matchMedia !== "function") {
    return false
  }

  try {
    return window.matchMedia(query).matches
  } catch {
    // 媒体查询不可用时使用显式的浅色和完整动效安全默认值。
    return false
  }
}

/** 在浏览器支持时写入 CSS 属性，否则写入已知安全的回退值。 */
function setSupportedProperty(
  root: HTMLElement,
  property: string,
  cssProperty: string,
  value: string,
  fallback: string
): void {
  root.style.setProperty(
    property,
    supportsCssValue(cssProperty, value) ? value : fallback
  )
}

/** 将一套语义色板映射到根元素的 CSS 自定义属性。 */
function applyPalette(
  root: HTMLElement,
  palette: ThemePalette,
  fallback: ThemePalette
): void {
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
  systemDark = matchesMediaQuery(COLOR_SCHEME_QUERY)
): ResolvedThemeMode {
  if (mode !== "system") return mode
  return systemDark ? "dark" : "light"
}

/** 将动效偏好解析为实际使用的模式。 */
export function resolveMotionPreference(
  preference: MotionPreference,
  systemReduced = matchesMediaQuery(REDUCED_MOTION_QUERY)
): ResolvedMotionPreference {
  if (preference !== "system") return preference
  return systemReduced ? "reduce" : "full"
}

/**
 * 订阅系统配色和减少动效偏好变化。
 *
 * @param listener - 任一系统偏好变化时执行的刷新函数。
 * @returns 对称移除本函数建立的全部监听的清理函数。
 */
export function subscribeToSystemPreferences(listener: () => void): () => void {
  if (!canUseDom() || typeof window.matchMedia !== "function") {
    return () => undefined
  }

  const subscribedQueries: MediaQueryList[] = []

  try {
    const queries = [
      window.matchMedia(COLOR_SCHEME_QUERY),
      window.matchMedia(REDUCED_MOTION_QUERY),
    ]

    for (const query of queries) {
      query.addEventListener("change", listener)
      subscribedQueries.push(query)
    }

    /** 移除当前订阅建立的系统偏好监听。 */
    function unsubscribe(): void {
      for (const query of subscribedQueries) {
        query.removeEventListener("change", listener)
      }
    }

    return unsubscribe
  } catch {
    // 部分订阅失败时回滚已注册监听，避免受限浏览器留下孤立副作用。
    for (const query of subscribedQueries) {
      query.removeEventListener("change", listener)
    }
    return () => undefined
  }
}

/** 主题配置应用到文档后得到的具体运行时状态。 */
export interface AppliedThemeState {
  /** 当前实际使用的浅色或深色模式。 */
  resolvedTheme: ResolvedThemeMode

  /** 当前实际使用的减少或完整动效模式。 */
  resolvedMotion: ResolvedMotionPreference
}

/**
 * 将主题配置同步到根元素和 shadcn 语义 CSS 变量。
 *
 * @returns 本次实际生效的主题和动效模式。
 */
export function applyThemeConfig(
  config: ThemeConfig,
  root = canUseDom() ? document.documentElement : undefined
): AppliedThemeState {
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

/**
 * 在 React 挂载前恢复并应用主题，避免首屏主题闪烁。
 *
 * @param storageKey - 与 ThemeProvider 保持一致的主题存储键。
 * @param fallback - 没有合法持久化配置时使用的完整主题。
 * @returns 本次初始化读取并应用的主题配置。
 *
 * @example
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
export function initializeTheme(
  storageKey: string = THEME_STORAGE_KEY,
  fallback: ThemeConfig = DEFAULT_THEME_CONFIG
): ThemeConfig {
  const config = readStoredThemeConfig(storageKey, fallback)
  applyThemeConfig(config)
  return config
}
