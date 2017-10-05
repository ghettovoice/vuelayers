module.exports = {
  recurseDepth: 10,
  plugins: [
    'plugins/underscore',
    // 'build/jsdoc/inline',
    'build/jsdoc/markdown',
    'build/jsdoc/vue',
  ],
  source: {
    // include: ['./src'],
    includePattern: '\\.(vue|js)$',
  },
}
