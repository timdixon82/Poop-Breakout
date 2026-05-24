// ESLint flat config (ESLint 9+) with TypeScript-aware rules.
// Uses @typescript-eslint/parser to parse .ts files.
// Rule set: the @typescript-eslint/recommended set plus security
// rules that map to OWASP Top 10.

import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // TypeScript-recommended rules (subset of no-override, strict-boolean,
      // no-explicit-any, etc.)
      ...tsPlugin.configs['recommended'].rules,

      // Security rules (OWASP A03 Injection, A09 Logging)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // Code quality
      'no-unused-vars': 'off',           // Superseded by @typescript-eslint version
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'eqeqeq': 'error',

      // Tone down some rules that are too noisy for a single-developer project
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
