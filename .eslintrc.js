module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    "linebreak-style": ["error", "unix"]
  }
}
