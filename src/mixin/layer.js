import { isFunction, pick } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import baseLayer from './base-layer'
import olCmp from './ol-cmp'
import sourceContainer from './source-container'

/**
 * Base simple layer mixin.
 */
export default {
  mixins: [
    sourceContainer,
    baseLayer,
  ],
  props: {
    // ol/layer/Layer
    /**
     * @type {function|undefined}
     */
    render: Function,
    // custom
    /**
     * @type {boolean}
     */
    overlay: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    ...makeWatchers([
      'render',
      'overlay',
    ], prop => async function () {
      if (process.env.VUELAYERS_DEBUG) {
        this.$logger.log(`${prop} changed, scheduling recreate...`)
      }

      await this.scheduleRecreate()
    }),
  },
  created () {
    /**
     * @type {module:ol/source/Source~Source|undefined}
     * @private
     */
    this._source = undefined

    this::defineServices()
  },
  methods: {
    /**
     * @returns {Promise<module:ol/renderer/Layer~LayerRenderer>}
     */
    async getRenderer () {
      return (await this.resolveLayer()).getRenderer()
    },
    /**
     * @param {module:ol/Map~Map|Object|undefined} map
     * @return {Promise<void>}
     */
    async setMap (map) {
      if (isFunction(map.resolveOlObject)) {
        map = await map.resolveOlObject()
      }

      (await this.resolveLayer()).setMap(map)
    },
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     * @protected
     */
    getSourceTarget: baseLayer.methods.resolveOlObject,
    /**
     * @returns {module:ol/source/Source~Source|undefined}
     */
    getSource () {
      return this._source
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.overlay && this.$mapVm) {
        await this.setMap(this.$mapVm)
      } else if (this.$layersContainer) {
        await this.$layersContainer.addLayer(this)
      }

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.overlay) {
        await this.setMap(null)
      } else if (this.$layersContainer) {
        await this.$layersContainer.removeLayer(this)
      }

      return this::olCmp.methods.unmount()
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::baseLayer.methods.getServices(),
        this::sourceContainer.methods.getServices(),
      )
    },
    ...pick(baseLayer.methods, [
      'init',
      'deinit',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'subscribeAll',
      'resolveOlObject',
      'resolveLayer',
    ]),
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {module:ol/source/Source~Source|undefined}
     */
    $source: {
      enumerable: true,
      get: this.getSource,
    },
  })
}
