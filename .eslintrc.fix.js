// ESLint自动修复脚本配置
module.exports = {
  extends: [
    './eslint.config.js'
  ],
  rules: {
    // 临时放宽一些规则以便自动修复
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/no-use-v-if-with-v-for': 'warn'
  }
}