import Vue from 'vue'
import { hasProp, identity, IdentityMap, keys, stubObject } from '../utils'

// global prop
export const IDENTITY_MAP_PROP = '$vlIdentityMap'
export const INSTANCES_POOL = 'instances'

export default {
  data () {
    return {
      idents: stubObject(),
    }
  },
  beforeCreate () {
    initIdentityMap()
    // define local getter
    Object.defineProperties(this, {
      $identityMap: {
        enumerable: true,
        get: () => this[IDENTITY_MAP_PROP],
      },
    })
  },
  destroyed () {
    this.unsetInstances()
  },
  methods: {
    /**
     * @param parts
     * @return {string}
     */
    makeIdent (...parts) {
      return parts.filter(identity).join('.')
    },
    /**
     * Caches or reuse factory result in the identity map
     * and returns result.
     *
     * @param {string|undefined} ident
     * @param {function} factory
     * @returns {*}
     */
    instanceFactoryCall (ident, factory) {
      if (ident && this.hasInstance(ident)) {
        return this.getInstance(ident)
      }

      const inst = factory()

      if (ident) {
        this.setInstance(ident, inst)
      }

      return inst
    },
    /**
     * @param {string|undefined} ident
     * @returns {*}
     */
    getInstance (ident) {
      if (!ident || !this.hasInstance(ident)) return

      this.idents[ident] = true

      return this.$identityMap.get(ident, INSTANCES_POOL)
    },
    /**
     * @param ident
     * @param inst
     */
    setInstance (ident, inst) {
      if (!ident) return

      this.idents[ident] = true
      this.$identityMap.set(ident, inst, INSTANCES_POOL)
    },
    /**
     * @param {string|undefined} ident
     * @returns {*}
     */
    hasInstance (ident) {
      if (!ident) return

      return this.$identityMap.has(ident, INSTANCES_POOL)
    },
    /**
     * @param {string|undefined} ident
     * @return {void}
     */
    unsetInstance (ident) {
      if (!ident) return

      delete this.idents[ident]
      this.$identityMap.unset(ident, INSTANCES_POOL)
    },
    /**
     * Unsets all self indets
     * @return {void}
     */
    unsetInstances () {
      keys(this.idents).forEach(::this.unsetInstance)
    },
    /**
     * @param {string|undefined} fromIdent
     * @param {string|undefined} toIdent
     * @returns {boolean}
     */
    moveInstance (fromIdent, toIdent) {
      return this.$identityMap.move(fromIdent, toIdent, INSTANCES_POOL)
    },
  },
}

function initIdentityMap () {
  if (
    hasProp(Vue, IDENTITY_MAP_PROP) ||
    hasProp(Vue.prototype, IDENTITY_MAP_PROP)
  ) return

  const imap = new IdentityMap()

  if (!hasProp(Vue, IDENTITY_MAP_PROP)) {
    Object.defineProperties(Vue, {
      [IDENTITY_MAP_PROP]: {
        enumerable: true,
        get: () => imap,
      },
    })
  }

  if (!hasProp(Vue.prototype, IDENTITY_MAP_PROP)) {
    Object.defineProperties(Vue.prototype, {
      [IDENTITY_MAP_PROP]: {
        enumerable: true,
        get: () => imap,
      },
    })
  }
}
