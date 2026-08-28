# 可复用配置模板

本目录保存规则正文和与规则对应的配置模板。模板不会自动对 `web` 生效；使用时必须复制到目标前端项目根目录，并确认依赖版本、源码路径、TypeScript 配置和模块系统一致。

## 文件用途

| 文件                    | 用途                                                      |
| ----------------------- | --------------------------------------------------------- |
| `eslint.config.js`      | ESLint 9 及以上的 Flat Config，也是当前项目使用的配置形式 |
| `.eslintrc`             | ESLint 8 及以下项目的兼容模板，不用于当前项目             |
| `.prettierrc`           | Prettier 与 Tailwind CSS 4 排序配置                       |
| `stylelint.config.js`   | 新项目优先使用的 Stylelint 配置                           |
| `.stylelintrc`          | 旧项目兼容的 Stylelint 配置                               |
| `commitlint.config.js`  | 项目提交消息检查配置                                      |
| `lint-staged.config.js` | 暂存文件检查和格式化配置                                  |

## 使用原则

- 当前项目及新项目优先使用 `eslint.config.js`。
- `.eslintrc` 只为仍使用旧版 ESLint 的项目保留，禁止为了使用它而降级 ESLint。
- `.prettierrc` 中的 Tailwind 样式入口按目标项目目录调整。
- 当前项目及新项目优先使用 `stylelint.config.js`；`.stylelintrc` 只作为旧项目兼容模板。
- 两种 Stylelint 模板都允许 Tailwind CSS 4 指令，并为 `#root` 与 reduced-motion 场景保留受控例外。
- `commitlint.config.js` 与 `10-git.md` 使用完全相同的提交类型集合。
- lint-staged 只处理暂存文件，不运行全项目 typecheck 或 build，也不调用 `git add`。
- ESLint 模板要求目标项目安装 JavaScript、TypeScript、React Hooks、React Refresh、浏览器全局变量和 JSX 可访问性插件。
- Stylelint 模板要求标准 CSS 配置；Commitlint 和 lint-staged 模板要求对应命令行依赖。
- 复制模板后必须通过配置语法检查和项目完整 CI，禁止只复制文件不验证。

## 依赖清单

- ESLint Flat Config：`eslint`、`@eslint/js`、`typescript`、`typescript-eslint`、`globals`、`eslint-plugin-react-hooks`、`eslint-plugin-react-refresh`、`eslint-plugin-jsx-a11y`。
- Prettier：`prettier`、`prettier-plugin-tailwindcss`。
- Stylelint：`stylelint`、`stylelint-config-standard`。
- Commitlint：`@commitlint/cli`、`@commitlint/types`。
- 暂存文件检查：`lint-staged`；Git Hook 工具根据目标仓库现有方案选择，不由本模板强制指定。

## 模块格式

所有 `.config.js` 模板使用 ESM 导出，适用于当前 Vite 项目的模块设置。目标项目如果使用 CommonJS，应改为 `.cjs` 并转换导出语法，不能混用。
