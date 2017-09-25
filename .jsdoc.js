module.exports = {
  recurseDepth: 10,
  plugins: [
    'plugins/markdown',
    'plugins/underscore',
    'build/jsdoc-plugins/vue',
  ],
  source: {
    include: ['./src'],
    includePattern: '\\.(vue|js)$',
  },
}
