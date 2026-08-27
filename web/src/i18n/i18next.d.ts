import "i18next"

import type auth from "@/i18n/resources/zh-CN/auth.json"
import type common from "@/i18n/resources/zh-CN/common.json"
import type { DEFAULT_NAMESPACE } from "@/i18n/config"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NAMESPACE
    resources: {
      auth: typeof auth
      common: typeof common
    }
    returnNull: false
  }
}
