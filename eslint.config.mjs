import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylisticJs from "@stylistic/eslint-plugin-js";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        plugins: {
            "@stylistic/js": stylisticJs
        },
        rules: {
            "@stylistic/js/indent": ["error", 2],
            "@stylistic/js/quotes": ["error", "double"],
            "@stylistic/js/semi": ["error", "always"]
        }
    },
    {files: ["**/*.{js,mjs,cjs,ts}"]},
    {languageOptions: { globals: globals.node }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];