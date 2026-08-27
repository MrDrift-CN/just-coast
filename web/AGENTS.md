# Web 开发约束

修改 `web` 下的界面、组件、主题或样式前，必须先阅读并遵守
`src/style/README.md`。

- 保持 Tailwind、shadcn、assistant-ui 和 Typeset 的职责边界。
- 优先使用已有组件、组件变体和主题语义令牌。
- 不为当前没有需求的场景提前增加主题或排版预设。
- 不批量覆盖 shadcn 或 assistant-ui 生成的组件。
- 完成修改后运行格式化、Lint、类型检查和生产构建。
