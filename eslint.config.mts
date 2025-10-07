// eslint.config.js
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier"; // <-- Import prettier config

export default [
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  ...tseslint.configs.recommended,

  eslintConfigPrettier, // <-- Tambahkan ini di paling akhir
];
