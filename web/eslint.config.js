// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'public/**',
      '.eslintcache'
    ]
  },

  {
    files: ['src/**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },

    settings: {
      react: { version: 'detect' }
    },

    rules: {
      // Core
      ...js.configs.recommended.rules,

      // React
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // Fast refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],

      // React adjustments
      'react/prop-types': 'off',
      'react/display-name': 'off',

      // Hooks strict
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Clean code
      'no-console': 'warn',
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],

      // Formatting (không cần Prettier vẫn ổn)
      'semi': ['warn', 'never'],
      'quotes': ['error', 'single'],
      'indent': ['warn', 2],
      'object-curly-spacing': ['warn', 'always'],
      'comma-dangle': ['warn', 'never'],
      'arrow-spacing': 'warn',
      'keyword-spacing': 'warn'
    }
  }
])