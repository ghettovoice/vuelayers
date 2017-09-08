import Vue from 'vue'
import { identity } from 'lodash/fp'
import { IDENTITY_MAP_PROP } from '../consts'
import IdentityMap from '../utils/identity-map'

export default {
  props: {
    // unique key for saving to identity map
    ident: [String, Number],
  },
  methods: {
    getFullIdent (...parts) {
      if (!this.ident) return

      return [this.$options.name, this.ident, ...parts].filter(identity).join(':')
    },
  },
  created () {
    this::initIdentityMap()
  },
}

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
