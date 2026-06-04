import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import { defineConfig } from 'eslint/config';

export default defineConfig(
    // 1. Globally ignored folders
    {
        ignores: ["node_modules/**", "dist/**"],
    },

    // 2. Base ESLint recommended rules for JavaScript & TypeScript
    js.configs.recommended,

    // 3. TypeScript recommended rules
    ...tseslint.configs.recommended,

    // 4. Next.js, React, and React Hooks configuration
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        settings: {
            react: {
                version: "detect", // Automatically detects React version
            },
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
    },

    // 5. Prettier integration to disable conflicting formatting rules
    eslintConfigPrettier,
);
