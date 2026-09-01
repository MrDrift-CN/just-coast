import { Navigate } from "react-router"
import type { RouteObject } from "react-router"

import { Main } from "@/chat/layouts/main"
import { History } from "@/chat/pages/history.tsx"
import { News } from "@/chat/pages/news"
import { NewsDetail } from "@/chat/pages/news-detail"
import { Welcome } from "@/chat/pages/welcome.tsx"

/** Chat 功能拥有的布局、欢迎、具体对话、AI 时讯列表和详情路由。 */
export const CHAT_ROUTES = [
  {
    path: "/chat",
    Component: Main,
    children: [
      {
        index: true,
        element: <Navigate replace to="/chat/welcome" />,
      },
      {
        path: "welcome",
        Component: Welcome,
      },
      {
        path: "thread_id/:thread_id",
        Component: History,
      },
      {
        path: "news",
        Component: News,
      },
      {
        path: "news/:news_id",
        Component: NewsDetail,
      },
    ],
  },
] satisfies readonly RouteObject[]
