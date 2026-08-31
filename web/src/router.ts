import { createBrowserRouter } from "react-router"

import {
  GithubCallbackRoute,
  LoginRedirect,
  LoginRoute,
  QrLoginConfirmationRoute,
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
    Component: LoginRoute,
  },
  {
    path: "/auth/github/callback",
    Component: GithubCallbackRoute,
  },
  {
    path: "/auth/qr-confirm",
    Component: QrLoginConfirmationRoute,
  },
  {
    path: "*",
    Component: LoginRedirect,
  },
])
