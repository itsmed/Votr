import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import n from "eslint-plugin-n";
import security from "eslint-plugin-security";
import unicorn from "eslint-plugin-unicorn";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config([
  js.configs.recommended,
  tseslint.configs.recommended,
  n.configs["flat/recommended"],
  security.configs.recommended,
  unicorn.configs.recommended,
  {
    settings: {
      n: {
        tryExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      },
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        tsconfigRootDir: dirname,
      },
    },
    rules: {
      "n/no-unsupported-features/node-builtins": ["error", { ignores: ["fetch"] }],
      "unicorn/no-null": "off",
      "unicorn/prefer-module": "off",
      "unicorn/filename-case": [
        "error",
        { cases: { kebabCase: true, camelCase: true, pascalCase: true } },
      ],
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            req: false,
            res: false,
            err: false,
            db: false,
            env: false,
            i: false,
            idx: false,
            params: false,
            val: false,
            num: false,
            dir: false,
          },
        },
      ],
    },
  },
  {
    files: ["tests/**"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    files: ["db/**", "bin/**"],
    rules: {
      "n/no-process-exit": "off",
      "unicorn/no-process-exit": "off",
      "unicorn/prefer-top-level-await": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
]);
