export default {
  provide () {
    return {
      $ctx: this.__ctx
    }
  },
  beforeCreate () {
    /**
     * @type {Object}
     * @private
     */
    this.__ctx = Object.create(null)
  },
  methods: {
    provide (key, value) {
      if (typeof key === 'object') {
        Object.keys(key).forEach(k => this.provide(k, key[ k ]))
      } else {
        Object.defineProperty(this.__ctx, key, {
          enumerable: true,
          get () {
            return value
          }
        })
      }
    }
  }
}
