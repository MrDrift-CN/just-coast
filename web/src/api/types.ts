import type { RequestAuthMode } from "@/api/authentication"

/** 后端确认请求成功时返回的统一业务码。 */
export const API_SUCCESS_CODE = 20_000

/** 通用 API 响应信封，负责承载协议状态与经过校验的业务数据。 */
export interface ApiResponse<TData> {
  /** 后端业务码；成功时为 `20000`，失败码由具体业务接口定义。 */
  readonly code: number

  /** 后端回显的 HTTP 状态；必须与真实响应状态保持一致。 */
  readonly status: number

  /** 供排查协议问题使用的后端消息，不得由界面直接展示。 */
  readonly message: string

  /** 经当前业务适配器校验后的响应数据。 */
  readonly data: TData
}

/** 通用请求层允许业务服务选择的 HTTP 方法。 */
export const API_REQUEST_METHOD = {
  /** 读取资源，不携带 JSON 请求体。 */
  get: "GET",
  /** 创建资源或触发具有副作用的操作。 */
  post: "POST",
  /** 完整替换目标资源。 */
  put: "PUT",
  /** 部分更新目标资源。 */
  patch: "PATCH",
  /** 删除目标资源。 */
  delete: "DELETE",
} as const

/** 通用请求层支持的 HTTP 方法值。 */
export type ApiRequestMethod =
  (typeof API_REQUEST_METHOD)[keyof typeof API_REQUEST_METHOD]

/** 可安全编码到 URL 查询字符串中的标量值。 */
export type ApiQueryValue = string | number | boolean

/** 通用请求支持的查询参数集合；空值会被忽略。 */
export interface ApiQuery {
  /** 参数名称对应的标量值；同名多值由具体服务自行使用 `URLSearchParams` 建模。 */
  readonly [name: string]: ApiQueryValue | null | undefined
}

/** 将不可信响应数据校验并转换为具体 DTO 的解析契约。 */
export interface ApiDataParser<TData> {
  /**
   * 校验单个接口的 `data` 字段。
   *
   * @throws {Error} 数据不符合接口契约时抛出，由请求层统一转换为协议错误。
   */
  (value: unknown): TData
}

/** 通用 JSON 请求选项；具体服务必须选择超时并提供数据解析器。 */
export interface ApiRequestOptions<TData> {
  /** 当前接口使用的 HTTP 方法；省略时按只读请求处理。 */
  readonly method?: ApiRequestMethod

  /** 按协议编码到请求 URL 的非敏感查询参数。 */
  readonly query?: ApiQuery

  /** 序列化为 JSON 请求体的数据；密码和令牌不得放入 `query`。 */
  readonly json?: unknown

  /** 调用方用于页面离开、输入变化或主动取消的信号。 */
  readonly signal?: AbortSignal

  /** 当前接口额外需要的非敏感请求头。 */
  readonly headers?: Readonly<Record<string, string>>

  /** 请求需要的认证模式；省略时为完全公开请求。 */
  readonly authMode?: RequestAuthMode

  /** 写操作是否必须附带内存中的 CSRF Token。 */
  readonly requiresCsrf?: boolean

  /** 当前操作允许等待的毫秒数，必须是大于零的有限数值。 */
  readonly timeoutMs: number

  /** 负责校验并转换响应信封中的 `data` 字段。 */
  readonly parseData: ApiDataParser<TData>
}
