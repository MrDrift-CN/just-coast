# 工程配置与复用模板

本规则说明 `assets/configs` 中可复用配置的适用范围。模板不会自动对 `web` 或其他项目生效；复制前必须核对目标项目的依赖版本、源码路径、TypeScript 配置、模块系统和现有命令，复制后必须完成语法检查及项目验证。

## 模板清单

| 资产                                      | 用途                                                      |
| ----------------------------------------- | --------------------------------------------------------- |
| `../assets/configs/eslint.config.js`      | ESLint 9 及以上的 Flat Config，也是当前项目优先采用的形式 |
| `../assets/configs/.eslintrc`             | ESLint 8 及以下项目的兼容模板，不用于当前项目             |
| `../assets/configs/.prettierrc`           | Prettier 与 Tailwind CSS 4 类名排序配置                   |
| `../assets/configs/stylelint.config.js`   | 当前项目和新项目优先采用的 Stylelint 配置                 |
| `../assets/configs/.stylelintrc`          | 旧版 Stylelint 项目的兼容模板                             |
| `../assets/configs/commitlint.config.js`  | 提交消息检查配置                                          |
| `../assets/configs/lint-staged.config.js` | 仅面向暂存文件的检查和格式化配置                          |

## 选型与适配

- **必须**优先使用 `eslint.config.js`。`.eslintrc` 只服务于仍使用旧版 ESLint 的项目，禁止为使用该模板而降级依赖。
- **必须**优先使用 `stylelint.config.js`。`.stylelintrc` 只服务于兼容旧版 Stylelint 的项目。
- **必须**按目标项目调整 `.prettierrc` 中 Tailwind 样式入口，不得假定所有项目都使用 `src/style/index.css`。
- **必须**让 `commitlint.config.js` 的提交类型与 `git.md` 完全一致；修改一侧时同步修改另一侧。
- **必须**让 lint-staged 只处理暂存的代码、样式和结构化配置文件。Markdown 文档不属于代码检查范围，不得匹配 `*.md`；禁止在其中运行全项目 typecheck、build 或 `git add`。
- **必须**根据目标项目的模块系统选择文件格式。模板使用 ESM；CommonJS 项目应改用 `.cjs` 并转换导出语法。
- **必须**核对脚本名称与文件匹配模式，禁止复制后依赖不存在的 `lint`、`stylelint` 或格式化命令。
- **应该**沿用目标项目现有的 Git Hook 工具，不由模板强制引入新的 Hook 管理方案。

## 依赖要求

- ESLint Flat Config 核心：`eslint`、`@eslint/js`、`typescript`、`typescript-eslint`、`globals`、`eslint-plugin-react-hooks`、`eslint-plugin-react-refresh`。
- JSX 可访问性插件只有在 peer 依赖明确支持目标 ESLint 主版本时才可安装；禁止使用 `--force` 或 `--legacy-peer-deps` 绕过兼容约束。
- Prettier：`prettier`、`prettier-plugin-tailwindcss`。
- Stylelint：`stylelint`、`stylelint-config-standard`。
- Commitlint：`@commitlint/cli`、`@commitlint/types`。
- 暂存文件检查：`lint-staged`。
- Git Hook：`husky`，只负责在 Git 边界调用已有项目脚本。

缺少依赖时，先确认项目包管理器和版本策略，再安装匹配版本。禁止用关闭插件、删除关键规则或扩大忽略范围代替正确安装。

## 与当前项目的关系

- `web` 使用 ESLint 10 Flat Config 和现代 JavaScript Stylelint 配置；不得在 `web` 新增 `.eslintrc` 或 `.stylelintrc`。
- ESLint 对自有 TypeScript 启用类型感知规则，对 `components/ui`、`components/assistant-ui` 和官方 `use-mobile.ts` 保留上游边界。
- 当前 `eslint-plugin-jsx-a11y` 正式版的 peer 范围不包含 ESLint 10，因此 `web` 不强制安装；兼容版本发布前继续由 React、组件和 Code Review 规则覆盖可访问性语义。
- Stylelint 必须识别 Tailwind CSS 4 指令，只允许 `#root` 这一 ID，并把 reduced-motion 中必要的 `!important` 保留为可见警告。
- 格式细节由 Prettier 决定；类型正确性由 TypeScript 决定；语义和边界由 ESLint、Stylelint 与规则文档共同约束。
- 规则与工具配置发生冲突时，必须在同一变更中修正规则或配置，不能长期保留两套结论。

## 复制后的验证

1. 检查 JSON 或 JavaScript 配置语法。
2. 使用目标项目本地安装的工具解析配置，确认插件和 extends 均可解析。
3. 对代表性源码运行格式化检查、ESLint 和 Stylelint。
4. 运行项目 typecheck、相关测试和构建。
5. 检查 lint-staged 的文件匹配结果，确保只影响暂存文件且不重复执行高成本全量任务。
6. 检查变更范围，禁止顺带格式化或改写无关文件。

## 开发过程中的审查分工

- `codeReview.md` 定义开发前、实施中、自动修复后和完成前的人工语义审查，是所有自有代码变更的必经过程。
- ESLint、Prettier、TypeScript、Stylelint、测试和构建只负责各自能够机械判断的部分，不能替代 `codeReview.md`。
- lint-staged 只在提交前处理暂存文件，无法覆盖未暂存和未跟踪的开发中变更。
- Commitlint 只检查提交消息，不检查代码正确性。
- `PReview.md` 只在 Pull Request、合并和批准决策时使用，不能代替作者在开发中的持续自审。
- 开发者或 Codex 必须以目标项目实际存在的配置、依赖和脚本为准；`assets/configs` 中有模板不代表目标项目已经启用对应检查。

## 当前 `web` 生效状态

| 审查层      | 当前状态                   | 实际入口或边界                                                                                       |
| ----------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| Prettier    | 已接入                     | `web/.prettierrc`、`web/.prettierignore`、`npm run format` 与 `npm run format:check`；忽略 Markdown |
| ESLint      | 已接入类型感知 Flat Config | `web/eslint.config.js`、`npm run lint` 与 `npm run lint:fix`；JSX 可访问性插件受 ESLint 10 peer 约束 |
| TypeScript  | 已接入                     | `npm run typecheck`，生产构建还会执行 `tsc -b`                                                       |
| 生产构建    | 已接入                     | `npm run build`                                                                                      |
| Stylelint   | 已接入                     | `web/stylelint.config.js`、`npm run lint:css` 与 `npm run lint:css:fix`                              |
| Commitlint  | 已接入                     | `web/commitlint.config.js`、`npm run commitlint` 与 `.husky/commit-msg`                              |
| lint-staged | 已接入                     | `web/lint-staged.config.js`、`npm run lint:staged` 与 `.husky/pre-commit`                            |
| Git Hook    | 已接入                     | 仓库级 Husky；`web/package.json` 的 `prepare` 初始化 `.husky/_`                                      |
| 自动化测试  | 未接入                     | 当前没有测试脚本或测试框架，按 `testing.md` 执行最低门禁和人工验证                                   |

- **必须**如实报告实际运行的检查。已接入不等于本次已经执行；未运行的命令不得写成“已通过”。
- **必须**让 `web/package.json` 的依赖、脚本、现代配置、锁文件和 Husky Hook 保持一致；不能只复制单个配置文件。
- **必须**保留 ESLint 10、TypeScript 6、Tailwind CSS 4 和当前 Node engine 的兼容性，不能为安装插件降级核心工具或绕过 peer 检查。
- **应该**将 `npm run lint`、`npm run lint:css` 和定向格式检查前移到开发循环；高成本全量检查和构建放在完成前或 CI。
- Commitlint 与 lint-staged 只覆盖 Git 边界，不能替代开发中的完整工作树审查。

## 项目案例

以下案例覆盖模板选型、开发中审查分工、当前生效状态、适配、依赖、项目边界和复制后验证。模板是输出资产，案例不能替代对目标项目实际配置的检查。

### 案例：为当前项目选择现代配置

**覆盖**：ESLint 与 Stylelint 的现代/旧版选择，禁止为模板降级。

```text
目标：web（ESLint 10、ESM）
✅ assets/configs/eslint.config.js
❌ assets/configs/.eslintrc

目标：仍使用兼容旧版 Stylelint 的历史项目
✅ 确认版本后使用 .stylelintrc
❌ 为使用 dotfile 主动降级当前 web
```

### 案例：复制 Prettier 后调整 Tailwind 入口

**覆盖**：目标样式入口和目录差异。

- `web` 的 Tailwind 入口是 `src/index.css`，复制模板后必须核对该路径。
- 另一个项目若使用 `app/styles.css`，应把模板选项改为该实际入口。
- ❌ 未检查路径直接复制，导致类名排序插件无法读取 Tailwind 主题。

### 案例：Commitlint 与 lint-staged 同步职责

**覆盖**：提交类型一致、暂存文件范围、禁止高成本全量任务和 `git add`。

- 新增提交类型时，同时修改 `references/git.md` 与 `commitlint.config.js`，不能一侧接受、另一侧拒绝。
- lint-staged 可以对匹配的暂存 TS/TSX 运行 ESLint 和 Prettier，对 CSS 运行 Stylelint 和 Prettier，并对 HTML、JSON、JSONC、YAML 运行 Prettier。
- Markdown 文档不匹配 lint-staged，也不参与 CI 的代码格式检查；文档正确性由对应文档任务和人工审查负责。
- lint-staged 不运行全项目 `npm run typecheck`、`npm run build`，也不执行 `git add`；这些由正常验证或 CI 负责。

### 案例：模块系统和脚本名称必须适配

**覆盖**：ESM/CommonJS、文件后缀、命令和匹配模式。

```text
web/package.json: "type": "module"
✅ eslint.config.js 使用 ESM export default

CommonJS 目标项目
✅ commitlint.config.cjs 使用 module.exports
❌ 在 .js 中混用 ESM 与 CommonJS
```

目标项目没有 `stylelint` 脚本时，先按其脚本策略补齐或调整模板；不能复制一个永远无法执行的命令。

### 案例：依赖缺失时修复环境而非降级规则

**覆盖**：ESLint、Prettier、Stylelint、Commitlint、lint-staged 依赖及正确安装策略。

- `eslint-plugin-jsx-a11y` 的正式版 peer 范围不包含 ESLint 10 时，保持它不进入 `web` 依赖树，并记录可访问性仍由语义规则与 Code Review 覆盖。
- ❌ 使用 `--force`、`--legacy-peer-deps`、降低 ESLint 主版本、扩大 `src` ignore 或关闭 strict 来让配置“通过”。
- ✅ 依赖版本与目标 ESLint、TypeScript、React 和 Node 匹配，并保留锁文件评审；兼容版本发布后再独立评估插件接入。

### 案例：规则与工具不能长期冲突

**覆盖**：当前 Flat Config、Tailwind 4 例外、工具职责、规则/配置同步。

- `web` 使用 Flat Config；`.eslintrc` 只作为跨旧项目资产，不能复制到当前项目。
- Stylelint 允许项目实际使用的 Tailwind 4 指令，以 `selector-id-pattern` 只接受 `#root`，并把 reduced-motion 的必要 `!important` 保留为警告。
- Prettier 决定格式，TypeScript 决定类型，ESLint/Stylelint 决定可自动检查的语义边界。
- 若规则禁止原始色板而 ESLint 未覆盖该目录，应在同一变更修复配置或明确规则边界，不能长期让两者给出相反结果。

### 案例：复制后的完整验收

**覆盖**：语法、配置解析、代表性源码、typecheck/测试/build、lint-staged 匹配、无关变更。

```text
1. JSON.parse / node --check 通过
2. 目标项目本地工具成功解析插件和 extends
3. 代表性 TSX 与 CSS 的 lint/format 检查通过
4. typecheck、相关测试、生产 build 通过
5. lint-staged 配置解析通过；默认运行在没有暂存文件时安全退出
6. git diff 不含无关全仓格式化或上游改写
```

只看到配置文件“能打开”不算完成；必须证明它在目标项目真实运行。

### 案例：模板存在不等于项目已接入

**覆盖**：实际配置优先、当前 `web` 状态、如实报告和独立接入变更。

- ❌ 因为 Skill 的 `assets/configs` 存在模板，就在没有运行项目命令时写“全部工具已通过”。
- ✅ 核对 `web` 后说明：Prettier、类型感知 ESLint、TypeScript、Stylelint、Commitlint、lint-staged、Husky 和构建已经接入；自动化测试尚未接入。
- ✅ 本次实际执行了 `npm run lint:css` 才能报告 Stylelint 结果；Commitlint 和 lint-staged 也必须分别验证样例消息、配置加载、无暂存边界和实际 Hook。

### 案例：开发中审查不能等到提交

**覆盖**：Code Review、自动工具、lint-staged、Commitlint 和 PReview 的职责边界。

```text
开发前：读取 codeReview 和领域规则，确认工作树与影响范围
实施中：检查阶段性 diff，运行变更文件格式与定向静态检查
完成前：审查完整工作树，运行 lint、typecheck、相关测试和必要构建
提交前：由 lint-staged 处理暂存文件，由 Commitlint 检查消息
合并前：使用 PReview 审查完整 PR、风险、证据和批准条件
```

即使以后接入全部 Hook，开发者仍不能跳过实施中的语义审查；Hook 看不到未暂存文件的完整行为和设计上下文。
