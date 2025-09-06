/* eslint config (root) */
module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    project: ['./**/tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  env: { browser: true, es2021: true, node: true },
  plugins: ['@typescript-eslint', 'vue'],
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/multi-word-component-names': 'off'
  },
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/npm-cache/**']
}