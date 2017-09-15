import * as components from './cmps'

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
