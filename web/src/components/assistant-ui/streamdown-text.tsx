/**
 * Streamdown Markdown 文本模块。
 *
 * 为 assistant-ui 的普通回复和推理内容提供流式 Markdown 渲染、代码高亮、
 * 数学公式、Mermaid 图表、CJK 优化、后端链接校验和 URL 安全限制。
 *
 * @remarks
 * 当前启用延迟解析、原生流式动画、流式光标、不完整 Markdown 修复、
 * Mermaid 严格模式与失败重试、链接安全确认和 URL/图片白名单。
 *
 * Streamdown 已经提供默认分块、Shiki 明暗主题和代码/表格控件，因此不覆盖
 * components、componentsByLanguage、BlockComponent 或
 * parseMarkdownIntoBlocksFn。需要扩展时参见官方 Props 文档。
 *
 * 所有 VITE 前缀变量都会进入浏览器产物，禁止存放访问令牌、API 密钥或
 * 可信身份。链接校验通过项目 `fetchRequest` 取得认证信息；X-User-Id 只
 * 作为请求元数据，后端必须结合已认证会话与访问令牌验证身份。
 *
 * @see https://www.assistant-ui.com/docs/ui/streamdown#advanced-configuration
 * @see https://www.assistant-ui.com/docs/ui/streamdown#props
 * @see https://ui.shadcn.com/docs/typeset
 * @packageDocumentation
 * @since 1.0.0
 */

"use client"

import { StreamdownTextPrimitive } from "@assistant-ui/react-streamdown"
import { cjk } from "@streamdown/cjk"
import { code } from "@streamdown/code"
import { math } from "@streamdown/math"
import { mermaid } from "@streamdown/mermaid"

import { fetchRequest, REQUEST_AUTH_MODE } from "@/api"

const FALLBACK_BROWSER_ORIGIN = "http://localhost"

const getBrowserOrigin = () =>
  typeof window === "undefined"
    ? FALLBACK_BROWSER_ORIGIN
    : window.location.origin

const unique = (values: readonly string[]) =>
  Array.from(new Set(values.filter(Boolean)))

const splitCsv = (value: string | undefined) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? []

const toAbsoluteUrl = (value: string | undefined, fallback: string) => {
  try {
    return new URL(value?.trim() || fallback, getBrowserOrigin()).toString()
  } catch {
    return new URL(fallback, getBrowserOrigin()).toString()
  }
}

const backendOrigin = new URL(
  toAbsoluteUrl(import.meta.env.VITE_BACKEND_ORIGIN, getBrowserOrigin())
).origin

const toPrefix = (value: string | undefined, fallback: string) => {
  const url = new URL(value?.trim() || fallback, backendOrigin)

  if (
    (url.protocol === "http:" || url.protocol === "https:") &&
    !url.pathname.endsWith("/")
  ) {
    url.pathname += "/"
  }

  return url.toString()
}

const publicPrefix = toPrefix(
  import.meta.env.VITE_BACKEND_PUBLIC_PREFIX,
  "/public/"
)

/**
 * Streamdown Markdown 文本组件。
 *
 * 作为 MessagePrimitive.Parts 的 text 分支渲染器，将 assistant-ui 当前消息
 * 文本交给 Streamdown，并统一应用项目插件、高级配置和安全策略。
 *
 * @returns Streamdown Markdown 渲染元素。
 * @example
 * ~~~tsx
 * <MessagePrimitive.Parts>
 *   {({ part }) => (part.type === "text" ? <StreamdownText /> : null)}
 * </MessagePrimitive.Parts>
 * ~~~
 * @see https://www.assistant-ui.com/docs/ui/streamdown#advanced-configuration
 * @public
 * @since 1.0.0
 */
export function StreamdownText() {
  return (
    <StreamdownTextPrimitive
      defer
      animated
      caret="block"
      plugins={{ code, math, mermaid, cjk }}
      mermaid={{
        config: { securityLevel: "strict" },
        errorComponent: ({ error, retry }) => (
          <div className="my-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="text-destructive">
              Mermaid 图表渲染失败：{String(error)}
            </p>
            <button
              type="button"
              className="mt-2 rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
              onClick={retry}
            >
              重新渲染
            </button>
          </div>
        ),
      }}
      remend={{
        links: true,
        images: true,
        linkMode: "protocol",
        bold: true,
        italic: true,
        boldItalic: true,
        inlineCode: true,
        strikethrough: true,
        katex: true,
        setextHeadings: true,
      }}
      linkSafety={{
        enabled: true,
        onLinkCheck: async (url) => {
          try {
            const target = new URL(url, backendOrigin)

            if (target.protocol === "mailto:") return true
            if (target.toString().startsWith(publicPrefix)) return true

            const response = await fetchRequest(
              toAbsoluteUrl(
                import.meta.env.VITE_BACKEND_LINK_CHECK_PATH,
                backendOrigin + "/api/security/check-link"
              ),
              {
                method: "POST",
                authMode: REQUEST_AUTH_MODE.required,
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: target.toString() }),
              }
            )

            if (!response.ok) return false

            const result = (await response.json()) as {
              readonly safe?: boolean
              readonly allowed?: boolean
            }
            return result.safe === true || result.allowed === true
          } catch {
            return false
          }
        },
      }}
      security={{
        allowedLinkPrefixes: unique([
          publicPrefix,
          "mailto:",
          ...splitCsv(
            import.meta.env.VITE_STREAMDOWN_ALLOWED_LINK_PREFIXES
          ).map((prefix) => toPrefix(prefix, prefix)),
        ]),
        allowedImagePrefixes: unique([
          toPrefix(import.meta.env.VITE_BACKEND_IMAGE_PREFIX, "/api/files/"),
          ...splitCsv(
            import.meta.env.VITE_STREAMDOWN_ALLOWED_IMAGE_PREFIXES
          ).map((prefix) => toPrefix(prefix, prefix)),
        ]),
        allowedProtocols: unique([
          "https",
          "mailto",
          new URL(backendOrigin).protocol.replace(":", ""),
          ...splitCsv(import.meta.env.VITE_STREAMDOWN_ALLOWED_PROTOCOLS),
        ]),
        allowDataImages: false,
        defaultOrigin: backendOrigin,
        blockedLinkClass: "pointer-events-none opacity-60",
        blockedImageClass: "hidden",
      }}
      containerClassName="typeset"
    />
  )
}
