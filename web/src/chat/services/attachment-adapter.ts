import type { AttachmentAdapter } from "@assistant-ui/react"

/** 单个聊天附件允许占用的最大字节数。 */
const CHAT_ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024

/** 用户反馈中展示的聊天附件大小上限。 */
export const CHAT_ATTACHMENT_MAX_SIZE_MEGABYTES = 10

/** Chat 附件适配器可以抛出的稳定错误代码。 */
export const CHAT_ATTACHMENT_ERROR_CODE = {
  /** 文件声明为音频或视频类型。 */
  unsupportedMedia: "chat-attachment-media-unsupported",

  /** 文件超过前端允许的单文件大小。 */
  tooLarge: "chat-attachment-too-large",
} as const

/**
 * Chat 文件选择器允许选择任意文件，并由适配器排除音频和视频。
 *
 * HTML `accept` 无法表达排除规则，因此保留通配符；文件服务接入后仍须校验真实内容、隔离存储并执行权限检查。
 */
const CHAT_ATTACHMENT_ACCEPT = "*"

/**
 * Chat 运行时使用的附件生命周期适配器。
 *
 * @remarks
 * 当前仅完成选择、校验和发送放行；文件系统接入后由其负责上传和资源权限。
 */
export const CHAT_ATTACHMENT_ADAPTER: AttachmentAdapter = {
  /** 文件选择器和拖放区域允许接收的 MIME 类型。 */
  accept: CHAT_ATTACHMENT_ACCEPT,

  /** 校验文件大小并创建等待发送的 assistant-ui 附件。 */
  add: ({ file }) => {
    if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
      throw new Error(CHAT_ATTACHMENT_ERROR_CODE.unsupportedMedia)
    }

    if (file.size > CHAT_ATTACHMENT_MAX_SIZE_BYTES) {
      throw new Error(CHAT_ATTACHMENT_ERROR_CODE.tooLarge)
    }

    const id = crypto.randomUUID()
    return Promise.resolve({
      id,
      type: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      contentType: file.type,
      file,
      status: { type: "requires-action", reason: "composer-send" },
    })
  },

  /** 从 Composer 中移除尚未发送的附件。 */
  remove: () => Promise.resolve(),

  /** 在文件系统接入前允许纯文本消息继续发送。 */
  send: (attachment) => {
    // TODO: 文件系统公开上传服务后，在此上传附件并把返回路径交给 Fetch Handler。
    return Promise.resolve({
      ...attachment,
      status: { type: "complete" },
      content: [],
    })
  },
}
