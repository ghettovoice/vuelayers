import { SERVICE_CONTAINER_KEY } from '../../consts'
import rxSubs from '../rx-subs'
import stubVNode from '../stub-vnode'
import { assertHasLayer, assertHasSource } from '../../utils/assert'

// todo extract attributions into separate component
const props = {
  attributions: [String, Array],
  logo: String,
  projection: String,
  wrapX: {
    type: Boolean,
    default: true
  }
}

const methods = {
  /**
   * @return {ol.source.Source}
   */
  getSource () {
    return this._source
  },
  /**
   * @return {void}
   */
  refresh () {
    assertHasSource(this)
    this.source.changed()
  },
  // protected & private
  /**
   * @return {ol.source.Source}
   * @protected
   * @abstract
   */
  createSource () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   */
  initialize () {
    /**
     * @type {ol.source.Source}
     * @protected
     */
    this._source = this.createSource()
    this._source.set('vm', this)
    this::defineAccessors()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    assertHasSource(this)
    assertHasLayer(this)

    this.layer.setSource(this.source)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    assertHasLayer(this)

    this.unsubscribeAll()
    this.layer.setSource(undefined)
  }
}

const watch = {
  attributions (value) {
    assertHasSource(this)
    this.source.setAttributions(value)
  }
}

export default {
  mixins: [rxSubs, stubVNode],
  props,
  methods,
  watch,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  inject: {
    serviceContainer: SERVICE_CONTAINER_KEY
  },
  provide () {
    const vm = this

    return {
      [SERVICE_CONTAINER_KEY]: {
        get source () { return vm.source },
        get layer () { return vm.layer },
        get map () { return vm.map },
        get view () { return vm.view }
      }
    }
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.mount()
  },
  destroyed () {
    this.unmount()
    this._source = undefined
  }
}

/**
 * @return {void}
 * @private
 */
function defineAccessors () {
  Object.defineProperties(this, {
    source: {
      enumerable: true,
      get: this.getSource
    },
    layer: {
      enumerable: true,
      get: () => this.serviceContainer.layer
    },
    map: {
      enumerable: true,
      get: () => this.serviceContainer.map
    },
    view: {
      enumerable: true,
      get: () => this.serviceContainer.view
    }
  })
}
