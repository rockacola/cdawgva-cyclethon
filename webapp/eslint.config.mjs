import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      // ── Sorting ────────────────────────────────────────────────────────────
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
            { pattern: '**/*.css', group: 'index', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'react/jsx-sort-props': ['error', { ignoreCase: true }],

      // ── Style / formatting ─────────────────────────────────────────────────
      curly: ['error', 'all'],

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
        { name: 'event', message: 'Use the local event parameter instead.' },
        { name: 'name', message: 'Use a local variable instead of the implicit global.' },
        { name: 'status', message: 'Use a local variable instead of window.status.' },
        { name: 'isNaN', message: 'Use Number.isNaN() instead.' },
        { name: 'isFinite', message: 'Use Number.isFinite() instead.' },
      ],

      // ── Useless code ───────────────────────────────────────────────────────
      'no-useless-concat': 'error',
      'no-useless-constructor': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',

      // ── React ──────────────────────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/no-unused-prop-types': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
];

export default eslintConfig;
