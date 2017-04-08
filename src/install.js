import * as components from './components'

export default function install (Vue) {
  Object.keys(components)
    .forEach(key => {
      if (typeof components[ key ].install === 'function') {
        Vue.use(components[ key ])
      }
    })
}
