process.env.EFF_ABSOLUTE_PATHS = process.env.EFF_ABSOLUTE_PATHS || true

// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaVersion: 2018,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'standard',
    'plugin:vue/recommended',
  ],
  // required to lint *.vue files
  plugins: [
    'node',
    'import',
    'promise',
    'vue',
  ],
  // add your custom rules here
  rules: {
    'vue/html-closing-bracket-newline': ['error', {
      'singleline': 'never',
      'multiline': 'never',
    }],
    'vue/require-default-prop': 'off',
    'vue/no-async-in-computed-properties': 'off',
    // allow paren-less arrow functions
    'arrow-parens': ['error', 'as-needed'],
    // allow async-await
    'generator-star-spacing': ['error', {
      'before': false,
      'after': true,
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': process.env.NODE_ENV === 'production' ? ['error', { 'allow': ['error', 'warn'] }] : 'off',
    'comma-dangle': ['error', 'always-multiline'],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
        'vue/script-indent': ['error', 2, {
          'baseIndent': 1,
          'switchCase': 1,
        }],
      },
    },
  ],
}
