---
name: web-project-rules
description: Apply just-coast's project-specific frontend rules whenever creating, modifying, refactoring, documenting, self-reviewing during development, reviewing pull requests, testing, renaming, moving, or configuring code under web, including TypeScript, React, CSS/Tailwind, components, Hooks, state, API, comments and documentation, directories, Git, tests, performance, security, internationalization, and quality-tool configuration. Do not use for backend-only work or untouched upstream/generated source.
---

# just-coast Web Project Rules

Use this Skill as the authoritative engineering-rule entry point for the `web` project. The project baseline is React 19, Vite 8, React Router 8, TypeScript 6, Tailwind CSS 4, shadcn/ui, and assistant-ui.

## Workflow

1. Inspect the requested change, affected paths, nearby implementation, package versions, and active project configuration.
2. Read `references/general.md` and `references/codeReview.md` completely for every change to owned frontend source or frontend tooling. Apply Code Review before editing, after each coherent implementation unit, after automatic fixes, and before delivery.
3. Use the routing table below to select the smallest complete set of additional references, then read every selected reference completely before editing or reviewing.
4. For a cross-cutting task, read the union of all applicable references. The most specific applicable rule controls; safety, correctness, accessibility, and maintainability take priority over style preferences.
5. Treat `web/src/components/ui` and `web/src/components/assistant-ui` as upstream/generated boundaries. Preserve their official naming and structure unless the task explicitly requires a minimal upstream edit. Read the relevant product-behavior references whenever such an edit changes UI, accessibility, security, or internationalization.
6. For UI, theme, or styling work, also inspect `web/AGENTS.md` and `web/src/style/README.md` when present.
7. Validate the result in proportion to risk and report any intentional exception or unresolved conflict.

## Rule routing

| Development scenario                                                                    | Read completely                                                 |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Any owned frontend source or tooling change                                             | `references/general.md`, `references/codeReview.md`             |
| TypeScript or JavaScript types, imports, naming, errors, async code                     | `references/typescript.md`                                      |
| Owned named functions, data models/fields, module constants, comments, or documentation | `references/comments.md`                                        |
| React components, pages, routes, JSX, rendering, Suspense                               | `references/react.md`                                           |
| CSS, Tailwind, theme tokens, responsive layout, motion, `Typeset`                       | `references/css.md`                                             |
| Shared components, shadcn/ui, assistant-ui, wrappers, accessibility                     | `references/components.md`, `references/react.md`               |
| Custom Hooks, Effects, subscriptions, browser APIs                                      | `references/hooks.md`                                           |
| Context, client state, persistence, URL state, server state, theme state                | `references/state.md`                                           |
| HTTP, API clients, DTOs, authentication requests, retries, errors                       | `references/api.md`, `references/security.md`                   |
| Add, move, rename, or reorganize files, directories, exports                            | `references/directory.md`                                       |
| Branches, commits, commit messages, pull requests                                       | `references/git.md`                                             |
| Development-time self-review, incremental diff review, completion review                | `references/codeReview.md` plus every affected domain reference |
| Pull Request, merge, peer review, or approval decision                                  | `references/PReview.md` plus every affected domain reference    |
| Unit, component, integration, or end-to-end tests                                       | `references/testing.md` plus the tested domain reference        |
| Bundle size, rendering, requests, perceived speed, regressions                          | `references/performance.md` plus the affected domain references |
| Authentication, authorization, secrets, URL/input validation, rich text, files, privacy | `references/security.md` plus the affected domain references    |
| Visible copy, locale resources, language switching, formatting                          | `references/i18n.md`                                            |
| ESLint, Prettier, Stylelint, Commitlint, lint-staged, or reusable configuration         | `references/tooling.md`                                         |

Common combinations:

- New or changed product UI: `general.md`, `codeReview.md`, `typescript.md`, `react.md`, `components.md`, `css.md`, and `i18n.md`.
- Stateful UI with a custom Hook: add `hooks.md` and `state.md`.
- Data-driven authenticated UI: add `api.md` and `security.md`.
- Any owned named function, data model or field, module-level constant, public contract, workaround, suppression, or documentation change: add `comments.md`.
- File or component rename: add `directory.md`; preserve public imports or migrate every consumer atomically.
- Development work: use `codeReview.md` continuously, not only after implementation is complete.
- Pull Request or merge review: use `PReview.md` as the approval procedure and domain references as acceptance criteria.

## Non-negotiable project invariants

- Use `@/` for internal imports and keep dependency direction consistent with the directory rules.
- Use camel-style names for owned files: PascalCase for React components and pages, lowerCamelCase for Hooks, utilities, services, stores, and other modules. Do not repeat the direct directory name or its established responsibility as a filename prefix or suffix. Preserve official filenames only inside the two upstream/generated component directories.
- Use semantic design tokens and existing theme primitives; do not hard-code a parallel visual system.
- Internationalize user-visible text and preserve locale-aware formatting.
- Do not weaken TypeScript, linting, accessibility, security, or validation controls to make a change pass.
- Do not bulk-format, rename, overwrite, or regenerate unrelated user or upstream code.
- Document every owned named function, data model and field, and module-level constant with concise TSDoc; apply the detailed boundaries in `references/comments.md`.
- External style guides are research input only. They never override the project-adapted conclusions in this Skill.

## Configuration assets

Files under `assets/configs` are reusable output templates, not instructions. Before copying one, read `references/tooling.md`, inspect the target project's dependency versions and module format, then adapt paths and options. Prefer the modern flat ESLint and JavaScript Stylelint configurations; the dotfile variants exist only for compatible legacy projects.

## Verification baseline

- Format or check only the changed files with the project-resolved formatter.
- Run `npm run lint` and `npm run typecheck` from `web` for owned source changes unless the task is documentation-only.
- Run `npm run lint:css` when CSS changes; review the reduced-motion `!important` warnings as intentional exceptions.
- Run the relevant tests when tests exist or behavior changed; add focused tests for regressions and risky logic.
- Run `npm run build` when routing, bundling, environment handling, configuration, lazy loading, or production behavior changed.
- Never hide a failure by disabling a rule, broadening an ignore, adding an unsafe assertion, or omitting a relevant check.

## Example contract

- Every reference file contains a `项目案例` section. Read it together with the normative section; examples are part of understanding the rule boundary, not optional decoration.
- Each normative rule must map to a bad example, a good example, or an explicit boundary scenario in the same reference file. A single cohesive case may cover several closely related rules when its `覆盖` line names those obligations.
- When adding, removing, or changing a rule, update its corresponding case in the same change. Do not leave a rule with only an abstract statement.
- Prefer examples using the repository's actual paths, dependencies, naming, theme, i18n, storage, and validation commands. Mark abbreviated code as illustrative when omitted details could otherwise be mistaken for an exception.
- Examples explain the normative text but never override it. If an example and a rule conflict, fix both in the same change and apply the rule only after the conflict is resolved.
