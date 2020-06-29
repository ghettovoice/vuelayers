module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }],
  ],
  plugins: [
    // Stage 0
    '@babel/plugin-proposal-function-bind',
    // Stage 1
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-logical-assignment-operators',
    ['@babel/plugin-proposal-optional-chaining', { loose: false }],
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
    // Stage 2
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
    // Stage 3
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    // Other
    ['@babel/plugin-transform-runtime', { useESModules: true }],
  ],
  env: {
    test: {
      plugins: [
        ['istanbul', { useInlineSourceMaps: false }],
      ],
    },
  },
}
