import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import "@/auth/styles.css"

/** 认证页面通用外壳的内容插槽。 */
export interface AuthShellProps {
  /** 页面外壳之外的辅助操作，例如语言切换。 */
  actions?: ReactNode

  /** 认证场景的页面主标题。 */
  title: string

  /** 主标题下方的场景说明。 */
  description: string

  /** 当前认证场景的表单内容。 */
  children: ReactNode

  /** 表单下方的场景导航内容。 */
  footer: ReactNode
}

/** 只提供认证页面布局和主题样式，不持有认证状态或流程。 */
export function AuthShell({
  actions,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <CardHeader className="items-center gap-3 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
            <h1>{title}</h1>
          </CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>

        <CardContent>{children}</CardContent>

        <CardFooter className="justify-center">{footer}</CardFooter>
      </Card>

      {actions ? <div className="auth-actions">{actions}</div> : null}
    </main>
  )
}
