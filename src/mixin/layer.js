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
    ], () => baseLayer.methods.scheduleRecreate),
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @returns {Promise<module:ol/renderer/Layer~LayerRenderer>}
     */
    async getLayerRenderer () {
      return (await this.resolveLayer()).getRenderer()
    },
    /**
     * @param {module:ol/Map~Map|Object|undefined} map
     * @return {Promise<void>}
     */
    async setLayerMap (map) {
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
     * @returns {Promise<module:ol/source/Source~Source|undefined>}
     */
    getLayerSource: sourceContainer.methods.getSource,
    /**
     * @param {module:ol/source/Source~Source|undefined} source
     * @returns {Promise<void>}
     */
    setLayerSource: sourceContainer.methods.setSource,
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.overlay && this.$mapVm) {
        await this.setLayerMap(this.$mapVm)
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
        await this.setLayerMap(null)
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
      get: () => this.$layer?.getSource(),
    },
  })
}
