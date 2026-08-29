import { createBrowserRouter } from "react-router"

import {
  ForgotPasswordRoute,
  LoginRedirect,
  LoginRoute,
  RegisterRoute,
} from "@/auth"

/** 路由实例只创建一次，各业务模块维护自己的路由适配组件。 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginRedirect,
  },
  {
    path: "/login",
    Component: LoginRoute,
  },
  {
    path: "/register",
    Component: RegisterRoute,
  },
  {
    path: "/forget",
    Component: ForgotPasswordRoute,
  },
  {
    path: "*",
    Component: LoginRedirect,
  },
])
