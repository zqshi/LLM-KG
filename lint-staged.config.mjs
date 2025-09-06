export default {
  '*.{ts,tsx,js,vue}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss,vue}': ['stylelint --fix'],
  '*.{json,md,yml,yaml}': ['prettier --write']
}