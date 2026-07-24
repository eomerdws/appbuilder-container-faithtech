import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-plugin-prettier/recommended";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  prettierConfig,
  svelte.configs["flat/recommended"],
  svelte.configs["flat/prettier"],
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    // SvelteKit routes run in Cloudflare's workerd (service-worker-shaped globals,
    // not Node); Svelte components run in the browser. Node globals are scoped
    // separately below to the handful of files that actually run under Node.
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
  },
  {
    files: ["vite.config.ts", "vitest.config.ts", "prisma.config.ts", "scripts/**/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js", "**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "none",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external", "internal"], "parent", "sibling"],
          alphabetize: { order: "asc" },
          named: true,
        },
      ],
      "import/no-unresolved": "off",
    },
  },
  globalIgnores([
    "**/.DS_Store",
    "**/node_modules",
    "build",
    ".svelte-kit",
    "package",
    "**/.env",
    "**/.env.*",
    "!**/.env.example",
    "**/.dev.vars",
    "**/.dev.vars.*",
    "!**/.dev.vars.example",
    "**/pnpm-lock.yaml",
    "**/package-lock.json",
    "**/yarn.lock",
    "out",
    "**/*.js",
    ".wrangler",
    "src/lib/server/generated",
    ".local",
    "worker-configuration.d.ts",
    "scriptoria-poller/**",
  ]),
);
