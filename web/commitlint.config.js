/** @type {import("@commitlint/types").UserConfig} */
export default {
  rules: {
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [1, "always", 100],
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [1, "always", 100],
    "header-max-length": [2, "always", 100],
    "scope-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", [".", "。", "!", "！", "?", "？"]],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
  },
}
