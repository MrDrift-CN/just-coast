# just-coast 贡献规范

本项目使用分支开发、Pull Request 审查和
[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
组织提交历史。请不要直接在 `main` 分支开发。

## 开发流程

1. 从最新的 `main` 创建任务分支。
2. 每个分支只处理一个明确主题。
3. 使用 Conventional Commits 编写提交。
4. 推送分支并创建以 `main` 为目标的 Pull Request。
5. 完成模板、标签和自动检查后再合并。

```powershell
git switch main
git pull
git switch -c feat/chat-interface

git add .
git commit -m "feat(chat): 完成对话界面基础结构"
git push -u origin feat/chat-interface
```

## 分支命名

格式为 `<type>/<short-description>`，描述使用小写英文和连字符。

| 前缀        | 用途             | 示例                         |
| ----------- | ---------------- | ---------------------------- |
| `feat/`     | 新功能           | `feat/chat-interface`        |
| `fix/`      | 缺陷修复         | `fix/link-safety`            |
| `docs/`     | 文档             | `docs/contributing`          |
| `refactor/` | 不改变行为的重构 | `refactor/streamdown-config` |
| `test/`     | 测试             | `test/chat-renderer`         |
| `chore/`    | 工具、依赖和维护 | `chore/update-dependencies`  |
| `ci/`       | 自动化工作流     | `ci/pr-policy`               |

## Commit 格式

```text
<type>[optional scope][optional !]: <description>

[optional body]

[optional footer(s)]
```

允许的类型：

| 类型       | 含义                             |
| ---------- | -------------------------------- |
| `feat`     | 新增用户可感知功能               |
| `fix`      | 修复缺陷                         |
| `docs`     | 仅修改文档                       |
| `style`    | 不改变行为的格式调整             |
| `refactor` | 不新增功能也不修复缺陷的代码重构 |
| `perf`     | 性能优化                         |
| `test`     | 新增或修正测试                   |
| `build`    | 构建系统或外部依赖变更           |
| `ci`       | CI/CD 配置变更                   |
| `chore`    | 其他维护性工作                   |
| `revert`   | 撤销已有提交                     |

Scope 用于描述受影响模块，例如 `chat`、`assistant-ui`、`web`、`repo`
或 `deps`。描述必须紧跟冒号和一个空格，简短说明实际变化。

```text
feat(chat): 增加消息流式渲染
fix(assistant-ui): 修复外部链接校验
docs(repo): 补充 Pull Request 流程
chore(deps): 更新前端依赖
```

一个提交同时包含多种独立变化时，应拆成多个提交。需要补充背景时，在标题后空
一行添加正文；关联 Issue 时使用 footer。

```text
fix(streamdown): 阻止未授权图片地址

限制 Markdown 图片只能来自配置的后端文件路径。

Closes: #12
```

不兼容变更必须在类型后加 `!`，或者使用大写
`BREAKING CHANGE:` footer。

```text
feat(api)!: 调整聊天接口响应格式

BREAKING CHANGE: 客户端必须读取新的 message parts 结构。
```

## Pull Request

- PR 标题必须符合与 Commit 相同的 Conventional Commits 格式。
- PR 应聚焦一个主题，并说明目的、实现方式和验证结果。
- 关联 Issue 时使用 `Closes #<number>` 或 `Refs #<number>`。
- 涉及界面变化时提供截图或录屏。
- 涉及安全、鉴权、环境变量或外部 URL 时说明风险和验证方式。
- 自动检查未通过时不得合并。

推荐使用 **Squash and merge**，并保留符合规范的 PR 标题作为最终提交标题。

## PR 标签

标签属于 Issue/PR，不属于普通 Git commit。自动标签规则会根据分支名和改动文件
添加以下 GitHub 默认标签：

| 条件                      | 标签            |
| ------------------------- | --------------- |
| `feat/*`                  | `enhancement`   |
| `fix/*`                   | `bug`           |
| `docs/*` 或 Markdown 文件 | `documentation` |
| `a11y/*`                  | `accessibility` |

其他标签可在 PR 详情中手动添加。

## 前端验证

前端样式修改必须遵守
[样式与主题规范](../web/src/style/README.md)。样式优先使用 shadcn 组件变体和
主题语义变量；Markdown 或其他语义化 HTML 内容统一通过 Typeset 排版。

提交 PR 前在 `web` 目录执行：

```powershell
npm ci
npm run lint
npm run typecheck
npx --no-install prettier --write <本次修改的文件>
npm run build
```

CI 会对 PR 中新增或修改的 JavaScript、TypeScript、CSS、JSON 和 YAML 文件
执行 Prettier 检查，不会因为未触及的历史文件或 Markdown 文档阻塞代码提交。

只提交 `.env.example` 中的示例配置。禁止提交真实令牌、密码、Cookie、私钥和
包含敏感值的 `.env` 文件。
