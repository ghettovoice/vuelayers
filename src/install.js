import * as components from './cmps'

/**
 * Registers all VueLayers components.
 * @param {Vue} Vue
 */
export default function install (Vue) {
  if (install.installed) return
  install.installed = true

  // install all components
  Object.keys(components)
    .forEach(key => {
      if (typeof components[key].install === 'function') {
        Vue.use(components[key])
      }
    })
}
