import { isFunction } from 'lodash/fp'

export default {
  inject: [],
  methods: {
    expose () {
      return {}
    }
  },
  created () {
    this::injectContext()
  },
  destroyed () {
    this.__context = {}
  }
}

function injectContext () {
  /**
   * @type {Object}
   * @private
   */
  this.__context = this.$parent && isFunction(this.$parent.expose)
    ? this.$parent.expose()
    : {}
  const inject = this.$options.inject || []

  inject.forEach(key => {
    if (this.__context[ key ] == null) throw new Error(`Property ${key} not found in context`)

    Object.defineProperty(this, key, {
      enumerable: true,
      get () {
        return this.__context[ key ]
      }
    })
  })
}
