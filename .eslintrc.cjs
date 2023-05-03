module.exports = {
  root: true,
  "ignorePatterns": [
    "bin/**/*",
    "node_modules/**/*",
    "jest.config.js"
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
};
