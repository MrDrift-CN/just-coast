import type { InitOptions } from "i18next"

import enUSAuth from "@/i18n/resources/en-US/auth.json"
import enUSChat from "@/i18n/resources/en-US/chat.json"
import enUSCommon from "@/i18n/resources/en-US/common.json"
import zhCNAuth from "@/i18n/resources/zh-CN/auth.json"
import zhCNChat from "@/i18n/resources/zh-CN/chat.json"
import zhCNCommon from "@/i18n/resources/zh-CN/common.json"
import {
  canonicalizeDetectedLocale,
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LOCALES,
} from "@/i18n/locale"

/** 应用翻译命名空间；新增值时必须同步所有支持语言的资源。 */
export const NAMESPACES = ["common", "auth", "chat"] as const

/** 未显式指定命名空间时使用的默认命名空间。 */
export const DEFAULT_NAMESPACE = "common" as const

/**
 * 应用内置语言资源。
 *
 * @remarks
 * 当前采用同步打包资源；未来切换按需加载时只需替换资源加载方式，组件仍按
 * namespace 使用翻译键。
 */
export const RESOURCES = {
  "en-US": {
    auth: enUSAuth,
    chat: enUSChat,
    common: enUSCommon,
  },
  "zh-CN": {
    auth: zhCNAuth,
    chat: zhCNChat,
    common: zhCNCommon,
  },
} as const

/**
 * i18next 初始化配置。
 *
 * @remarks
 * 检测顺序固定为合法用户偏好、浏览器支持语言和项目默认语言。自动检测结果
 * 不写入本地存储，只有用户显式选择才会持久化。
 */
export const I18N_CONFIG = {
  defaultNS: DEFAULT_NAMESPACE,
  detection: {
    caches: [],
    convertDetectedLanguage: canonicalizeDetectedLocale,
    lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    order: ["localStorage", "navigator"],
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
