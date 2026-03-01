import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';
import securityPlugin from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      n: nodePlugin,
      promise: promisePlugin,
      security: securityPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/no-relative-parent-imports': 'error',
      'promise/always-return': 'error',
      'security/detect-object-injection': 'warn',
    },
  },
  prettier,
);
