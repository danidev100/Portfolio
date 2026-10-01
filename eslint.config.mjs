import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const DOMAIN_TYPES = ['feature', 'ui', 'data-access', 'util'];

const domainElements = DOMAIN_TYPES.map((type) => ({
  type,
  pattern: `src/*/${type}`,
  capture: ['domain'],
}));

const allowFrom = (from, to) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: { anyOf: to } } } },
});

export default defineConfig([
  globalIgnores([
    '.next/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'claude/**',
    'next-env.d.ts',
  ]),
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'core', pattern: 'src/core' },
        { type: 'types', pattern: 'src/shared/types' },
        ...domainElements,
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            allowFrom('app', ['app', 'core', 'types', ...DOMAIN_TYPES]),
            allowFrom('core', ['core', 'types', 'ui', 'data-access', 'util']),
            allowFrom('feature', ['types', ...DOMAIN_TYPES]),
            allowFrom('ui', ['types', 'ui', 'util']),
            allowFrom('data-access', ['types', 'data-access', 'util']),
            allowFrom('util', ['types', 'util']),
            allowFrom('types', ['types']),
          ],
        },
      ],
    },
  },
  prettier,
]);
