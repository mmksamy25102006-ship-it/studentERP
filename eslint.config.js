import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      // The React Compiler is not installed, so its optimizer
      // diagnostics report patterns this codebase never
      // compiles (fetch-on-mount effects, manual memoization).
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',

      // Context providers legitimately export a hook next to
      // the component; treat the fast-refresh limitation as a
      // warning rather than an error.
      'react-refresh/only-export-components': 'warn',

      // Express needs four parameters for an error handler to
      // be recognised, so an unused trailing next is declared
      // and silenced with a leading underscore instead.
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // The API is CommonJS Node; these files are linted with
    // browser globals by default, which flags require,
    // module, process and friends.
    files: ['backend/**/*.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
