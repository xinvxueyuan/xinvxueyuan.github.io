import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";

export default defineConfig([
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["src/**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "vue/no-v-html": "off",
    },
  },
  globalIgnores([
    "dist/**",
    ".worktrees/**",
    "node_modules/**",
    "public/**",
    "src/generated/**",
    ".output/**",
  ]),
]);
