const chalk = require('chalk')
const ora = require('ora')
const rollup = require('rollup')
const utils = require('./utils')
const config = require('./config')
const rollupConfig = require('./rollup.esm.conf')

const spinner = ora('relax, your bundles are cooking...').start()

// ES6
rollup.rollup(rollupConfig)
  .then(bundler => {
    const { code, map } = bundler.generate({
      format: 'es',
      banner: rollupConfig.banner,
      sourceMap: rollupConfig.sourceMap
    })

    return Promise.all([
      utils.writeFile(rollupConfig.dest, code),
      utils.writeFile(rollupConfig.sourceMapFile, map.toString())
    ])
  })
  .then(([ sourceResult, mapResult ]) => {
    spinner.stop()
    console.log('\n' + chalk.bold.green('js ready'))
    console.log(chalk.bold(sourceResult.path) + ' ' + chalk.gray(sourceResult.size))
    console.log(chalk.bold(mapResult.path) + ' ' + chalk.gray(mapResult.size))
  })
  .catch(err => {
    spinner.stop()
    console.error(err.stack)
  })
