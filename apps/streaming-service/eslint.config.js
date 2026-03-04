import baseConfig from '@repo/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
