import Vue from 'vue'
import IdentityMap from '../util/identity-map'
import { identity } from '../util/minilo'

// todo uncomment when IE 11 will die
// const IDENTITY_MAP_PROP = Symbol('identityMap')
const IDENTITY_MAP_PROP = 'identityMap'
/**
 * @alias module:mixin/ident-map
 * @title identMap
 * @vueProto
 */
export default {
  IDENTITY_MAP_PROP,
  props: {
    /**
     * Unique key for saving to identity map
     * @type {string|number}
     * @experimental
     */
    ident: [String, Number],
  },
  methods: {
    /**
     * @param parts
     * @return {string|undefined}
     * @protected
     */
    makeSelfIdent (...parts) {
      if (!this.ident) return

      return this.makeIdent(this.ident, ...parts)
    },
    /**
     * @param parts
     * @return {string}
     */
    makeIdent (...parts) {
      return parts.filter(identity).join('.')
    },
  },
  created () {
    this::initIdentityMap()
  },
}

/**
 * @private
 */
function initIdentityMap () {
  if (!this[IDENTITY_MAP_PROP]) {
    Vue[IDENTITY_MAP_PROP] = Vue.prototype[IDENTITY_MAP_PROP] = new IdentityMap()
  }
  Object.defineProperties(this, {
    $identityMap: {
      enumerable: true,
      get: () => this[IDENTITY_MAP_PROP],
    },
  })
}
