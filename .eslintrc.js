module.exports = {
  extends: [
    'airbnb-base'
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': ['error', {allow: ['info', 'error']}],
    'no-underscore-dangle': 'off',
  }
}