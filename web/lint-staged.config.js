/** @type {import("lint-staged").Configuration} */
export default {
  "*.{js,jsx,ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"],
  "*.{html,json,jsonc,yaml,yml}": "prettier --write",
}
