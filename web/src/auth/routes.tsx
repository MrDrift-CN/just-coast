import {
  Navigate,
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router"

import { ForgotPassword } from "@/auth/pages/ForgotPassword"
import { Login } from "@/auth/pages/Login"
import { Register } from "@/auth/pages/Register"

/** 将登录页面动作连接到认证路由导航。 */
export function LoginRoute() {
  const navigate = useNavigate()

  return (
    <Login
      onForgotPassword={() => void navigate("/forget")}
      onRegister={() => void navigate("/register")}
    />
  )
}

/** 将注册页面的返回动作连接到登录路由。 */
export function RegisterRoute() {
  const navigate = useNavigate()

  return <Register onLogin={() => void navigate("/login")} />
}

/** 连接密码重置页面与静态预览阶段导航。 */
export function ForgotPasswordRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isResetStage = searchParams.get("stage") === "reset"

  /** 使用非敏感预览状态进入设置新密码阶段。 */
  const handleRequestReset = (): void => {
    void navigate(
      {
        pathname: "/forget",
        search: createSearchParams({ stage: "reset" }).toString(),
      },
      { replace: true }
    )
  }

  /** 完成静态预览后使用替换导航返回登录页面。 */
  const handleResetPassword = (): void => {
    void navigate("/login", { replace: true })
  }

  return (
    <ForgotPassword
      isResetStage={isResetStage}
      onLogin={() => void navigate("/login")}
      onRequestReset={handleRequestReset}
      onResetPassword={handleResetPassword}
    />
  )
}

/** 将认证功能的默认入口规范化到登录路由。 */
export function LoginRedirect() {
  return <Navigate replace to="/login" />
}
