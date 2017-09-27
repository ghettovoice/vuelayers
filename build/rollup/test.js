const fs = require('fs-extra')
// const externalize = require('./rollup-plugins/externalize')
const sass = require('./sass')
const utils = require('../utils')

// const p = externalize({
//   root: utils.resolve('src'),
//   newRoot: 'vuelayers/dist',
//   map: [
//     {
//       src: 'components/ol-virt-cmp',
//       dest: 'cjs/mixins/ol-virt-cmp',
//     },
//     {
//       src: 'components/use-map-cmp',
//       dest: 'cjs/mixins/use-map-cmp',
//     },
//     {
//       src: 'utils/multi-merge-descriptors',
//       dest: 'cjs/utils/multi-merge-descriptors',
//     },
//   ],
// })
//
// const file = utils.resolve('src/components/source/source.js')
// const res = p.transform(fs.readFileSync(file, { encoding: 'utf-8' }), file)

const p = sass({
  output: utils.resolve('dist-test/bundle2.css'),
  banner: '/*\nBanner\n*/',
  sass: {
    includePaths: [
      utils.resolve('node_modules'),
    ],
  },
  postProcess: utils.postcssProcess,
})

const file = utils.resolve('src/styles/main.sass')
p.options({})
Promise.resolve(p.transform(fs.readFileSync(file, { encoding: 'utf-8' }), file))
  .then(() => p.ongenerate())
  .then(res => console.log(res))
