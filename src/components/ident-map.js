import Vue from 'vue'
import { IDENTITY_MAP_PROP } from '../consts'
import IdentityMap from '../utils/identity-map'

export default {
  props: {
    // unique key for saving to identity map
    ident: [String, Number]
  },
  beforeCreate () {
    this::initIdentityMap()
  }
}

function initIdentityMap () {
  if (!this[IDENTITY_MAP_PROP]) {
    Vue[IDENTITY_MAP_PROP] = Vue.prototype[IDENTITY_MAP_PROP] = new IdentityMap()
  }
  Object.defineProperties(this, {
    identMap: {
      enumerable: true,
      get: () => this[IDENTITY_MAP_PROP]
    }
  })
}
