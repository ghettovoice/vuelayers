import * as components from './components'
/**
 * @param Vue
 */
export default function install (Vue) {
  // install all components
  Object.keys(components)
    .forEach(key => {
      if (typeof components[key].install === 'function') {
        Vue.use(components[key])
      }
    })
}
