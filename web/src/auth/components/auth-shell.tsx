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

/**
 * 认证页面公共外壳属性。
 *
 * @public
 * @since 1.0.0
 */
export interface AuthShellProps {
  /** 页面右上角的辅助操作。 */
  actions?: ReactNode

  /** 页面标题。 */
  title: string

  /** 页面说明。 */
  description: string

  /** 页面表单内容。 */
  children: ReactNode

  /** 卡片底部的辅助操作。 */
  footer: ReactNode
}

/**
 * 渲染统一的认证背景与液态玻璃卡片。
 *
 * @param props - 认证页面公共外壳属性。
 * @returns 认证页面布局。
 *
 * @remarks
 * 背景、卡片和控件外观只消费主题语义令牌，不持有登录或会话逻辑。
 * @public
 * @since 1.0.0
 */
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
