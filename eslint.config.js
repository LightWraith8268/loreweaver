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
    ],
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/rules-of-hooks': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
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
