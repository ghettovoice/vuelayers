module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'vue/html-closing-bracket-newline': [
      'error', {
        singleline: 'never',
        multiline: 'never',
      },
    ],
    'vue/require-default-prop': 'off',
    'generator-star-spacing': [
      'error', {
        before: false,
        after: true,
      },
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'spaced-comment': 'off', // to allow PURE annotation
  },
  overrides: [
    {
      files: [
        '*.vue',
      ],
      rules: {
        indent: 'off',
        'vue/script-indent': [
          'error',
          2,
          {
            baseIndent: 1,
            switchCase: 1,
          },
        ],
      },
    },
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        mocha: true,
      },
    },
  ],
}
