import "i18next"

import type auth from "@/i18n/resources/zh-CN/auth.json"
import type chat from "@/i18n/resources/zh-CN/chat.json"
import type common from "@/i18n/resources/zh-CN/common.json"
import type { DEFAULT_NAMESPACE } from "@/i18n/config"

declare module "i18next" {
  /** just-coast 对 i18next 默认命名空间与资源类型的扩展。 */
  interface CustomTypeOptions {
    /** 未传入 namespace 时使用的默认命名空间。 */
    defaultNS: typeof DEFAULT_NAMESPACE

    /** 由默认语言资源推导出的各业务命名空间类型。 */
    resources: {
      /** 认证流程翻译资源。 */
      auth: typeof auth

      /** 聊天功能翻译资源。 */
      chat: typeof chat

      /** 跨功能通用翻译资源。 */
      common: typeof common
    }

    /** 翻译调用不会把 null 作为有效结果返回。 */
    returnNull: false
  }
}
