module.exports = {
  plugins: [
    'plugins/markdown',
    'plugins/underscore',
    'build/jsdoc-plugins/vue',
  ],
  source: {
    include: ['./src/components/map/map.vue'],
    includePattern: '\\.(vue|js)$',
  },
}
