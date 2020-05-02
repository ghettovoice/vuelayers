import { fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { isFunction, pick } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import baseLayer from './base-layer'
import olCmp from './ol-cmp'
import sourceContainer from './source-container'
import RenderEventType from 'ol/render/EventType'

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
  methods: {
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
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::baseLayer.methods.subscribeAll()
      this::subscribeToLayerEvents()
    },
    ...pick(baseLayer.methods, [
      'beforeInit',
      'init',
      'deinit',
      'beforeMount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'resolveOlObject',
      'resolveLayer',
    ]),
    /**
     * @return {Promise<module:ol/layer/Base~BaseLayer>}
     * @protected
     */
    getSourceTarget: baseLayer.methods.resolveOlObject,
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
      if (map && isFunction(map.resolveOlObject)) {
        map = await map.resolveOlObject()
      }

      (await this.resolveLayer()).setMap(map)
    },
  },
}

async function subscribeToLayerEvents () {
  const renderEvents = obsFromOlEvent(this.$layer, [
    RenderEventType.PRERENDER,
    RenderEventType.POSTRENDER,
  ])
  this.subscribeTo(renderEvents, evt => {
    this.$emit(evt.type, evt)
  })
}
