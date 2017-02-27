import { isFunction } from 'lodash/fp'

export default {
  methods: {
    expose () {
      return {}
    }
  },
  created () {
    /**
     * @type {Object}
     * @protected
     */
    this.$context = this.$parent && isFunction(this.$parent.expose)
      ? this.$parent.expose()
      : {}
  },
  destroyed () {
    this.$context = {}
  }
}
