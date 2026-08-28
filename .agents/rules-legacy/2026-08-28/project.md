# 项目通用规则

## 适用范围

本文件承载适用于整个项目、但无法明确归属于 React、主题、国际化、模块导入等
专项规则的通用约束。

新增规则时应先判断是否存在职责清晰的专项规则文件；只有确实跨越多个技术层或
没有独立领域边界的内容才写入本文件，并按主题建立独立章节，避免形成无结构的
条目堆积。

## 品牌与实现命名

### 核心原则

`just-coast` 只代表项目/产品的名称，不应成为代码实现的命名空间或技术前缀。

品牌名称与技术实现必须解耦，使项目改名、复用或支持白标时，不需要大规模修改
内部标识。

### 适用范围

本规则适用于整个项目中的变量、函数、类型、模块、浏览器存储、Cookie、缓存、
事件、CSS、环境变量、请求头、API 字段、数据库字段及其他实现细节。

### 允许使用项目名称

- 仓库、项目和发布包名称。
- 页面标题、品牌文案和产品介绍。
- Logo、品牌资源及明确表达产品身份的元数据。
- 外部平台要求使用正式产品名称的展示性配置。

### 禁止事项

- 禁止使用 `just-coast`、`justCoast`、`JUST_COAST` 或其他变体作为技术命名空间
  或前缀。
- 禁止将项目名称写入 `localStorage`、`sessionStorage`、Cookie、IndexedDB、
  缓存或消息键。
- 禁止将项目名称用于变量、函数、类型、React Context、事件、CSS 类名或 CSS
  变量。
- 禁止将项目名称用于环境变量、请求头、API 字段或数据库字段，除非该字段表达的
  内容本身就是产品名称。
- 禁止以避免冲突为由添加品牌前缀；应使用业务域和功能语义形成稳定命名。

### 命名方式

1. 根据业务域和职责命名，不根据当前产品品牌命名。
2. 浏览器存储和缓存键使用功能语义，例如 `preferences.language`、
   `preferences.theme`、`auth.session`。
3. 变量、类型和函数直接描述其内容或行为，例如 `themeConfig`、
   `LocalePreference`、`loadSession`。
4. CSS 使用组件或语义名称，例如 `.auth-shell`、`--gradient-start`。
5. 环境变量保留工具要求的前缀，并使用功能名称，例如 `VITE_BACKEND_ORIGIN`。

### 示例

    just-coast.language  → preferences.language
    just-coast.theme     → preferences.theme
    justCoastTheme       → themeConfig
    JUST_COAST_USER_ID   → VITE_USER_ID
    --just-coast-primary → --primary

### 验收清单

- 检查新增标识是否描述业务或技术职责，而不是产品品牌。
- 搜索 `just-coast`、`justCoast` 和 `JUST_COAST`，确认匹配项只用于允许的品牌场景。
- 项目改名时，除品牌展示和项目元数据外，不应要求修改实现代码或持久化键。

