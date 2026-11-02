import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "examples/**", "results/**", "docs/site/**", "docs/site-src/**", ".openui/**", "**/.openui/**"] },
  js.configs.recommended,
  { files: ["scripts/**/*.mjs", "docs/**/*.mjs"], languageOptions: { globals: { URL: "readonly", console: "readonly", process: "readonly", fetch: "readonly", AbortSignal: "readonly" } } },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
);
