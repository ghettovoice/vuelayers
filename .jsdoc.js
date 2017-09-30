module.exports = {
  recurseDepth: 10,
  plugins: [
    'plugins/underscore',
    'build/jsdoc/vue',
  ],
  source: {
    include: ['./src'],
    includePattern: '\\.(vue|js)$',
  },
  markdown: {
    tags: [
      'examples'
    ],
  },
}
