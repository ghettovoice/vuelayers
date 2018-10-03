module.exports = function () {
  const presets = [
    ['@babel/preset-env', { modules: false, useBuiltIns: true }],
  ]
  const plugins = [
    // Stage 0
    '@babel/plugin-proposal-function-bind',
    // Stage 1
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-logical-assignment-operators',
    ['@babel/plugin-proposal-optional-chaining', { 'loose': false }],
    ['@babel/plugin-proposal-pipeline-operator', { 'proposal': 'minimal' }],
    ['@babel/plugin-proposal-nullish-coalescing-operator', { 'loose': false }],
    '@babel/plugin-proposal-do-expressions',
    // Stage 2
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
    // Stage 3
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { 'loose': false }],
    '@babel/plugin-proposal-json-strings',
    // Other
    '@babel/plugin-transform-runtime',
    [
      'transform-imports',
      {
        'rxjs/operator': {
          transform: 'rxjs/_esm2015/operator/${member}',
          preventFullImport: true,
          skipDefaultConversion: true,
        },
        'rxjs/observable': {
          transform: 'rxjs/_esm2015/observable/${member}',
          preventFullImport: true,
          skipDefaultConversion: true,
        },
        rxjs: {
          transform: 'rxjs/_esm2015/${member}',
          preventFullImport: true,
          skipDefaultConversion: true,
        },
      },
    ],
  ]
  const env = {
    test: {
      plugins: [
        'istanbul',
      ],
    },
  }

  return {
    presets,
    plugins,
    env,
  }
}
