const loaderUtils = require('loader-utils')

module.exports = function (source) {
  this.cacheable && this.cacheable()
  const options = loaderUtils.getOptions(this) || {}
  const jsdocDoclets = require(options.jsdocDocletsFile)

  // find main module entry doclet and child members
  const moduleDoclet = jsdocDoclets.find(
    ({ longname, undocumented }) => longname === options.name && !undocumented
  )
  const moduleMembers = jsdocDoclets.find(
    ({ memberof, undocumented, kind }) => memberof === moduleDoclet.longname && kind === 'member' && !undocumented
  )
  // todo get all doclets for module components, group by module and wrap into vue single file component
  // use @see tag? think about other ways of linking between entry script and components
  const components = moduleMembers.reduce(
    (all, { longname }) => {

    },
    []
  )
}
