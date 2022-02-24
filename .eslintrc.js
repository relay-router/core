/* eslint-disable */
module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "es2022": true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  plugins: [ "@typescript-eslint" ],
  "ignorePatterns": [ "*.config.*", ".*rc.js" ],
  "rules": {
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",
    "no-unused-vars": "off",
    "no-empty": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
