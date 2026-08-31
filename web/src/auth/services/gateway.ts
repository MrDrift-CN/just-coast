import { apiAuthGateway } from "@/auth/services/api"
import type { AuthGateway } from "@/auth/services/contract"
import { mockAuthGateway } from "@/auth/services/mock"

/** 认证数据源支持的运行模式。 */
export type AuthDataSource = "mock" | "api"

/**
 * 读取认证数据源；默认使用 Mock，后端可用后只需设置为 `api`。
 *
 * @remarks
 * 业务组件不得直接导入 Mock 或 API 实现，也不需要通过注释切换调用。
 */
function readAuthDataSource(): AuthDataSource {
  return import.meta.env.VITE_AUTH_DATA_SOURCE === "api" ? "api" : "mock"
}

/** 当前认证数据源，供开发工具和界面判断是否展示 Mock 辅助信息。 */
export const AUTH_DATA_SOURCE = readAuthDataSource()

/** 项目认证的唯一实现入口。 */
export const authGateway: AuthGateway =
  AUTH_DATA_SOURCE === "api" ? apiAuthGateway : mockAuthGateway
