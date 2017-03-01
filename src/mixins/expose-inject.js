import { isFunction, forEach, isString } from 'lodash/fp'

const forEachWithKey = forEach.convert({ cap: false })

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

  forEachWithKey((alias, field) => {
    field = isString(field) ? field : alias

    if (this.__context[ field ] == null) throw new Error(`Property ${field} not found in component context`)

    Object.defineProperty(this, alias, {
      enumerable: true,
      get () {
        return this.__context[ field ]
      }
    })
  }, inject)
}
