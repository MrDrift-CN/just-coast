/** 请求层向状态层公开的稳定错误码集合。 */
export const API_ERROR_CODE = {
  /** 浏览器无法建立或完成网络连接。 */
  networkUnavailable: "networkUnavailable",
  /** 请求超过当前操作明确设置的等待时间。 */
  requestTimedOut: "requestTimedOut",
  /** 调用方主动取消了不再需要的请求。 */
  requestCancelled: "requestCancelled",
  /** 受保护请求在发送前缺少完整真实身份。 */
  authenticationRequired: "authenticationRequired",
  /** 服务端明确拒绝了已经发送的身份，当前 Session 应视为过期。 */
  sessionExpired: "sessionExpired",
  /** 当前身份没有执行操作所需的权限。 */
  accessDenied: "accessDenied",
  /** 请求的资源不存在或不对当前身份公开。 */
  resourceNotFound: "resourceNotFound",
  /** 请求与服务端当前资源状态发生冲突。 */
  requestConflict: "requestConflict",
  /** 请求参数、方法或载荷不符合接口约束。 */
  invalidRequest: "invalidRequest",
  /** 请求频率超过服务端允许的限制。 */
  rateLimited: "rateLimited",
  /** 服务端或其上游暂时无法完成请求。 */
  serverUnavailable: "serverUnavailable",
  /** HTTP 请求成功，但后端业务码拒绝了当前操作。 */
  businessRejected: "businessRejected",
  /** 响应媒体类型、JSON 或统一信封不符合协议。 */
  invalidResponse: "invalidResponse",
  /** 请求失败，但当前边界无法安全判定具体原因。 */
  unexpectedError: "unexpectedError",
} as const

/** 状态层可映射到国际化文案的请求错误码。 */
export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE]

/** 创建结构化请求错误所需的诊断信息。 */
export interface ApiErrorOptions {
  /** 供状态层稳定判断和映射文案的错误码。 */
  readonly code: ApiErrorCode

  /** 浏览器收到的真实 HTTP 状态。 */
  readonly status?: number

  /** 后端返回的业务码；不得替代真实 HTTP 状态。 */
  readonly businessCode?: number

  /** 服务端响应头提供的脱敏请求标识。 */
  readonly requestId?: string

  /** 仅用于本地错误链排查的原始异常，不得直接展示或记录敏感内容。 */
  readonly cause?: unknown
}

/** 请求层统一抛出的结构化错误，界面只根据稳定 `code` 决定展示文案。 */
export class ApiError extends Error {
  /** 状态层用于分支处理和国际化映射的稳定错误码。 */
  readonly code: ApiErrorCode

  /** 浏览器收到的真实 HTTP 状态。 */
  readonly status?: number

  /** 后端业务码；仅用于业务失败定位。 */
  readonly businessCode?: number

  /** 服务端生成且不包含凭据的请求追踪标识。 */
  readonly requestId?: string

  /**
   * 根据脱敏诊断信息建立请求错误。
   *
   * @remarks
   * `message` 固定使用稳定错误码，调用方不得展示 `Error.message` 或后端原始消息。
   */
  constructor({
    code,
    status,
    businessCode,
    requestId,
    cause,
  }: ApiErrorOptions) {
    super(code, { cause })
    this.name = "ApiError"
    this.code = code
    this.status = status
    this.businessCode = businessCode
    this.requestId = requestId
  }
}

/** 判断未知异常是否已经过通用请求层归一化。 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** 将非成功 HTTP 状态映射为项目稳定错误码。 */
export function getHttpErrorCode(status: number): ApiErrorCode {
  if (status === 401) return API_ERROR_CODE.sessionExpired
  if (status === 403) return API_ERROR_CODE.accessDenied
  if (status === 404 || status === 410) return API_ERROR_CODE.resourceNotFound
  if (status === 408 || status === 504) return API_ERROR_CODE.requestTimedOut
  if (status === 409 || status === 412 || status === 423 || status === 428)
    return API_ERROR_CODE.requestConflict
  if (status === 429) return API_ERROR_CODE.rateLimited
  if (status >= 500) return API_ERROR_CODE.serverUnavailable
  if (status >= 400) return API_ERROR_CODE.invalidRequest
  return API_ERROR_CODE.unexpectedError
}
