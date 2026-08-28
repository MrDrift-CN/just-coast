/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: [
    "**/dist/**",
    "**/coverage/**",
    "**/node_modules/**",
    "**/*.min.css",
  ],
  reportDescriptionlessDisables: true,
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  rules: {
    "at-rule-empty-line-before": null,
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "apply",
          "config",
          "custom-variant",
          "plugin",
          "reference",
          "source",
          "theme",
          "utility",
          "variant",
        ],
      },
    ],
    "color-named": "never",
    "comment-empty-line-before": null,
    "declaration-block-no-redundant-longhand-properties": null,
    "declaration-empty-line-before": null,
    "declaration-no-important": [true, { severity: "warning" }],
    "hue-degree-notation": "number",
    "import-notation": "string",
    "length-zero-no-unit": null,
    "lightness-notation": "number",
    "media-feature-range-notation": "prefix",
    "no-duplicate-selectors": null,
    "property-no-vendor-prefix": [
      true,
      { ignoreProperties: ["-webkit-background-clip"] },
    ],
    "rule-empty-line-before": null,
    "selector-id-pattern": "^root$",
    "selector-max-id": null,
    "value-keyword-case": [
      "lower",
      {
        ignoreKeywords: [
          "currentColor",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
        ],
      },
    ],
  },
};
