import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["node_modules"],
  },
  ...tseslint.configs.recommended,
  pluginJs.configs.recommended,
  {
    files: ["**/*.{js,ts,mjs,cjs}"],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node,
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
]);
