import { useTranslation } from "react-i18next"
import { RouterProvider } from "react-router/dom"

import { SessionProvider } from "@/auth"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { router } from "@/router"
import { ThemeProvider } from "@/theme"

/** 挂载使用当前界面语言的全局浮层通知区域。 */
const AppToaster = () => {
  const { t } = useTranslation("common")

  return (
    <Toaster
      closeLabel={t("notifications.close")}
      limit={3}
      timeout={4000}
      viewportLabel={t("notifications.region")}
    />
  )
}

/** 组合应用级 Provider、路由和全局通知入口。 */
export const App = () => {
  return (
    <ThemeProvider>
      <SessionProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
          <AppToaster />
        </TooltipProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
