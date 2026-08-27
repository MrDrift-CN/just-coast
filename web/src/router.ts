import { createBrowserRouter } from "react-router"

import {
  ForgetRoute,
  LoginRedirect,
  LoginRoute,
  RegisterRoute,
} from "@/auth/routes"

/**
 * 浏览器路由。
 *
 * @remarks
 * 路由实例在 React 树外只创建一次。业务路由适配组件由对应业务模块维护。
 *
 * @public
 * @since 1.0.0
 */
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
    Component: ForgetRoute,
  },
  {
    path: "*",
    Component: LoginRedirect,
  },
])
