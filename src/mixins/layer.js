import RenderEventType from 'ol/render/EventType'
import { map as mapObs, tap } from 'rxjs/operators'
import { getSourceId } from '../ol-ext'
import { fromOlChangeEvent as obsFromOlChangeEvent, fromOlEvent as obsFromOlEvent } from '../rx-ext'
import { addPrefix, mergeDescriptors } from '../utils'
import baseLayer from './base-layer'
import { makeChangeOrRecreateWatchers } from './ol-cmp'
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
  computed: {
    source () {
      if (!(this.rev && this.$source)) return

      return {
        id: getSourceId(this.$source),
        type: this.$source.constructor.name,
      }
    },
  },
  watch: {
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'source',
      'render',
      'overlay',
    ], [
      'source',
    ]),
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.overlay && this.$mapVm) {
        this.setMap(this.$mapVm)
        return
      }

      return this::baseLayer.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.overlay) {
        this.setMap(null)
        return
      }

      return this::baseLayer.methods.unmount()
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
    /**
     * @return {module:ol/layer/Base~BaseLayer}
     * @protected
     */
    getSourceTarget () {
      return this.$layer
    },
    /**
     * @returns {module:ol/renderer/Layer~LayerRenderer}
     */
    getRenderer () {
      return this.$layer?.getRenderer()
    },
    /**
     * @param {module:ol/Map~Map|Object|undefined} map
     */
    setMap (map) {
      map = map?.$map || map

      this.$layer?.setMap(map)
    },
    /**
     * @param {string|undefined} value
     * @param {string|undefined} prev
     * @protected
     */
    sourceChanged (value, prev) {
      if (value === prev) return

      this.$emit('update:source', value)
    },
  },
}

async function subscribeToLayerEvents () {
  const setterKey = addPrefix('set')
  const sourceChanges = obsFromOlChangeEvent(this.$layer, 'source', true).pipe(
    tap(({ value: source }) => {
      if (this._sourceSubs) {
        this.unsubscribe(this._sourceSubs)
      }
      if (source) {
        this._sourceSubs = this.subscribeTo(
          obsFromOlChangeEvent(source, 'id', true),
          ::this.scheduleRefresh,
        )
      }
    }),
    mapObs(evt => ({
      ...evt,
      setter: this[setterKey(evt.prop)],
    })),
  )
  this.subscribeTo(sourceChanges, ({ setter, value }) => setter(value))

  const renderEvents = obsFromOlEvent(this.$layer, [
    RenderEventType.PRERENDER,
    RenderEventType.POSTRENDER,
  ])
  this.subscribeTo(renderEvents, evt => this.$emit(evt.type, evt))
}
