import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // ── Sorting ────────────────────────────────────────────────────────────
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],

      // ── Catching bugs / dead code ──────────────────────────────────────────
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-expressions': 'error',
      'no-unreachable': 'error',
      'no-template-curly-in-string': 'error',
      'no-self-compare': 'error',
      'no-self-assign': 'error',
      'getter-return': 'error',
      'use-isnan': 'error',
      'valid-typeof': ['error', { requireStringLiterals: true }],
      'array-callback-return': 'error',
      eqeqeq: ['error', 'always'],

      // ── Import hygiene ─────────────────────────────────────────────────────
      'import/no-duplicates': 'error',
      'import/first': 'error',

      // ── Dangerous patterns ─────────────────────────────────────────────────
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-extend-native': 'error',
      'no-loop-func': 'error',
      'no-caller': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'isNaN', message: 'Use Number.isNaN() instead.' },
        { name: 'isFinite', message: 'Use Number.isFinite() instead.' },
      ],

      // ── Style ─────────────────────────────────────────────────────────────
      curly: ['error', 'all'],

      // ── Useless code ───────────────────────────────────────────────────────
      'no-useless-concat': 'error',
      'no-useless-constructor': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
    },
  },
]);
