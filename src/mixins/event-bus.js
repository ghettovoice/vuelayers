import Vue from 'vue'
import { hasProp } from '../utils'

export const EVENT_BUS_PROP = '$vlEventBus'

export default {
  beforeCreate () {
    initEventBus()
    // define local getter
    Object.defineProperties(this, {
      /**
       * @type {Vue}
       */
      $eventBus: {
        enumerable: true,
        get: () => this[EVENT_BUS_PROP],
      },
    })
  },
}

function initEventBus () {
  if (
    hasProp(Vue, EVENT_BUS_PROP) ||
    hasProp(Vue.prototype, EVENT_BUS_PROP)
  ) return

  const bus = new Vue()

  if (!hasProp(Vue, EVENT_BUS_PROP)) {
    Object.defineProperties(Vue, {
      [EVENT_BUS_PROP]: {
        enumerable: true,
        get: () => bus,
      },
    })
  }

  if (!hasProp(Vue.prototype, EVENT_BUS_PROP)) {
    Object.defineProperties(Vue.prototype, {
      [EVENT_BUS_PROP]: {
        enumerable: true,
        get: () => bus,
      },
    })
  }
}
