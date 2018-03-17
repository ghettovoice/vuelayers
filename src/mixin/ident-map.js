/** @module mixin/ident-map */
import Vue from 'vue'
import IdentityMap from '../util/identity-map'
import { identity } from '../util/minilo'

const IDENTITY_MAP_PROP = Symbol('identityMap')
/**
 * @alias module:mixin/ident-map
 * @title identMap
 * @vueProto
 */
export default {
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
    makeIdent (...parts) {
      if (!this.ident) return

      return [this.ident, ...parts].filter(identity).join('.')
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
