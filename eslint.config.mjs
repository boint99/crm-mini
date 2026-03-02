import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "build/**", ".eslintcache"],
  },

  js.configs.recommended,

  {
    files: ["src/**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-undef": "error",

      indent: ["warn", 2],
      semi: ["error", "never"],
      quotes: ["error", "single"],
      "comma-dangle": ["warn", "never"],
      "object-curly-spacing": ["warn", "always"],
      "space-before-blocks": ["error", "always"],
      "arrow-spacing": "warn",
      "keyword-spacing": "warn",

      "no-constant-condition": "warn",
      "no-extra-boolean-cast": "off",
    },
  },
];
