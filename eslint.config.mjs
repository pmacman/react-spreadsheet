import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  // Disable all formatting rules so Prettier wins
  prettier,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // examples of GOOD ESLint rules to keep
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
];
