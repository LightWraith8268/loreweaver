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
  }
]);
