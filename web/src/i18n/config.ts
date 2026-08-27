import type { InitOptions } from "i18next"

import enUSAuth from "@/i18n/resources/en-US/auth.json"
import enUSCommon from "@/i18n/resources/en-US/common.json"
import zhCNAuth from "@/i18n/resources/zh-CN/auth.json"
import zhCNCommon from "@/i18n/resources/zh-CN/common.json"
import {
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from "@/i18n/locale"

/**
 * 应用翻译命名空间。
 *
 * @readonly
 * @public
 * @since 1.0.0
 */
export const NAMESPACES = ["common", "auth"] as const

/**
 * 默认翻译命名空间。
 *
 * @readonly
 * @public
 * @since 1.0.0
 */
export const DEFAULT_NAMESPACE = "common" as const

/**
 * 应用内置语言资源。
 *
 * @remarks
 * 当前采用同步打包资源；未来切换按需加载时只需替换资源加载方式，组件仍按
 * namespace 使用翻译键。
 *
 * @readonly
 * @public
 * @since 1.0.0
 */
export const RESOURCES = {
  "en-US": {
    auth: enUSAuth,
    common: enUSCommon,
  },
  "zh-CN": {
    auth: zhCNAuth,
    common: zhCNCommon,
  },
} as const

/**
 * i18next 初始化配置。
 *
 * @remarks
 * URL 查询参数 `lng` 优先用于预览指定语言；用户显式偏好、浏览器语言和
 * HTML 默认语言依次作为后续检测来源。自动检测结果不会直接写入本地存储。
 *
 * @readonly
 * @public
 * @since 1.0.0
 */
export const I18N_CONFIG = {
  defaultNS: DEFAULT_NAMESPACE,
  detection: {
    caches: [],
    convertDetectedLanguage: normalizeLocale,
    lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    lookupQuerystring: "lng",
    order: ["querystring", "localStorage", "navigator", "htmlTag"],
  },
  fallbackLng: DEFAULT_LOCALE,
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  load: "currentOnly",
  ns: NAMESPACES,
  react: {
    useSuspense: false,
  },
  resources: RESOURCES,
  returnEmptyString: false,
  returnNull: false,
  supportedLngs: SUPPORTED_LOCALES,
} as const satisfies InitOptions
