import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/dist/**',
    '**/.astro/**',
    '.agents/**',
    '.evals-private/**',
    'scripts/evals/fixtures/**',
  ]),
  {
    files: ['**/*.{js,mjs,cjs,ts,astro}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,astro}'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    // Astro scripts use TypeScript even when pnpm does not hoist its parser.
    processor: 'astro/client-side-ts',
  },
  {
    files: ['landing/src/scripts/**/*.ts', '**/*.astro', '**/*.astro/*.js'],
    languageOptions: { globals: globals.browser },
  },
);
