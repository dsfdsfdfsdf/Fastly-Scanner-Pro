import js from '@eslint/js'
import ts from 'typescript-eslint'
import next from '@next/eslint-plugin-next'
import globals from 'globals'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parser: ts.parser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@next/next': next,
    },
    extends: [
      js.configs.recommended,
      ...ts.configs.recommended,
      ...next.configs.recommended,
      ...next.configs['core-web-vitals']
    ],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];