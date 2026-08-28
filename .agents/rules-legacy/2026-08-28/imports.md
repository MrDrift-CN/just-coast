# 模块导入规则

## 适用范围

本规则适用于 web/src 下所有 JavaScript、TypeScript、React 组件、类型声明、
资源模块和样式导入。

## 必须遵守

1. 项目内部模块统一使用 @/ 别名，并从 web/src 根目录开始书写路径。
2. 同目录、父目录、跨业务模块和样式文件均遵循同一规则，不因距离较近改用相对路径。
3. 第三方依赖继续使用包名导入；类型依赖使用 import type 或 export type。
4. index.ts 等公开入口中的重导出也必须使用 @/，避免形成两套路径规范。
5. 移动源码文件时，只调整其 @/ 绝对路径，不引入临时兼容导出。

## 禁止事项

- 禁止使用以 ./ 或 ../ 开头的源码导入和重导出。
- 禁止通过增加多层 barrel 文件掩盖真实模块路径。
- 禁止为绕过本规则新增其他路径别名。

## 示例

    import { AuthShell } from "@/auth/components/auth-shell"
    import type { LoginFormValues } from "@/auth/types"
    import "@/auth/styles.css"

## 自动检查

web/eslint.config.js 的 no-restricted-imports 会阻止相对源码导入。
提交前至少运行：

    npm run typecheck
    npm run lint
