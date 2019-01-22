module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    "linebreak-style": ["error", "unix"],
    "no-console": ["warn"]
  }
}
