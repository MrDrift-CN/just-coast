import axios, { type AxiosResponse } from "axios"

import {
  API_ERROR_CODE,
  ApiError,
  getHttpErrorCode,
  isApiError,
} from "@/api/errors"

/** Axios 取消请求时使用的稳定错误标识。 */
const AXIOS_CANCELLED_CODE = "ERR_CANCELED"

/** Axios 因等待响应超时而使用的错误标识。 */
const AXIOS_TIMEOUT_CODES = new Set(["ECONNABORTED", "ETIMEDOUT"])

/** 服务端可能返回请求追踪标识的响应头名称。 */
const REQUEST_ID_HEADER_NAMES = ["x-request-id", "request-id"] as const

/** 从 Axios 响应头读取第一个非空请求追踪标识。 */
export function readApiRequestId(
  headers: AxiosResponse<unknown>["headers"]
): string | undefined {
  for (const headerName of REQUEST_ID_HEADER_NAMES) {
    const value: unknown = headers[headerName]

    if (typeof value === "string" && value.trim() !== "") {
      return value.trim()
    }
  }

  return undefined
}

/** 从不可信失败正文中读取整数业务码。 */
function readBusinessCode(value: unknown): number | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined
  }

  const code: unknown = Reflect.get(value, "code")
  return typeof code === "number" && Number.isInteger(code) ? code : undefined
}

/** 将 Axios 传输异常转换为项目稳定错误，避免业务层依赖库错误结构。 */
function normalizeAxiosError(error: unknown): ApiError {
  if (isApiError(error)) return error

  if (!axios.isAxiosError(error)) {
    return new ApiError({
      code: API_ERROR_CODE.unexpectedError,
      cause: error,
    })
  }

  if (error.code === AXIOS_CANCELLED_CODE) {
    return new ApiError({
      code: API_ERROR_CODE.requestCancelled,
      cause: error,
    })
  }

  if (error.code && AXIOS_TIMEOUT_CODES.has(error.code)) {
    return new ApiError({
      code: API_ERROR_CODE.requestTimedOut,
      cause: error,
    })
  }

  if (error.response) {
    return new ApiError({
      code: getHttpErrorCode(error.response.status),
      status: error.response.status,
      businessCode: readBusinessCode(error.response.data),
      requestId: readApiRequestId(error.response.headers),
      cause: error,
    })
  }

  if (error.request) {
    return new ApiError({
      code: API_ERROR_CODE.networkUnavailable,
      cause: error,
    })
  }

  return new ApiError({
    code: API_ERROR_CODE.invalidRequest,
    cause: error,
  })
}

/** 通用请求使用的后端来源。 */
export const API_ORIGIN = new URL(
  import.meta.env.VITE_BACKEND_ORIGIN || window.location.origin,
  window.location.origin
).origin

/** 项目唯一 Axios 实例；业务服务必须通过通用 `request` 包装器使用。 */
export const apiClient = axios.create({
  baseURL: API_ORIGIN,
  headers: { Accept: "application/json" },
  validateStatus: () => true,
  withCredentials: false,
})

apiClient.interceptors.response.use(
  /** 保留成功建立连接的响应，由通用请求层校验 HTTP 与业务协议。 */
  function preserveResponse(response) {
    return response
  },
  /** 只在 Axios 未能产生正常响应时归一化底层异常。 */
  function rejectNormalizedError(error: unknown) {
    return Promise.reject(normalizeAxiosError(error))
  }
)
