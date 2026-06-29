import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["frontend/**", "backend/**", "baseline/**", "node_modules/**", ".next/**", "scripts/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  }
);
