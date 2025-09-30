const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/**',
      'dist-fixed/**',
      'dist-new/**',
      'web-build/**',
      'web-build-old/**',
      'web-dist/**',
      'win/**',
      'public/**',
      'scripts/**',
      'metro.config.js',
    ],
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
  },
]);
