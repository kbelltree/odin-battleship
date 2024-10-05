import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
  {
    files: ["tests/**/*"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        jest: true,
      },
    },
  },
];
