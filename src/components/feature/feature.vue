<script type="text/babel">
  import uuid from 'uuid/v4'
  import mergeDescriptors from '../../utils/multi-merge-descriptors'
  import Observable from '../../rx-ext'
  import rxSubs from '../rx-subs'
  import stubVNode from '../stub-vnode'
  import plainProps from '../../utils/plain-props'
  import styleTarget from '../style-target'
  import { consts, coordHelper, geoJson } from '../../ol-ext'
  import { assertHasFeature, assertHasMap, assertHasView, assertHasLayer, assertHasSource } from '../../utils/assert'
  import { SERVICE_CONTAINER_KEY } from '../../consts'

  const { LAYER_PROP } = consts
  const { toLonLat } = coordHelper

  const props = {
    id: {
      type: [String, Number],
      default: () => uuid()
    },
    properties: {
      type: Object,
      default: () => Object.create(null)
    }
  }

  const methods = {
    /**
     * @returns {ol.Feature|undefined}
     */
    getFeature () {
      return this._feature
    },
    /**
     * @param {number} pixel
     * @return {boolean}
     */
    isAtPixel (pixel) {
      assertHasFeature(this)
      assertHasMap(this)

      const cb = feature => feature === this.feature
      const layerFilter = layer => layer === this.layer

      return this.map.forEachFeatureAtPixel(pixel, cb, { layerFilter })
    },
    /**
     * @return {void}
     */
    refresh () {
      assertHasFeature(this)
      this.feature.changed()
    },
    // protected & private
    /**
     * @return {ol.Feature}
     * @protected
     */
    getStyleTarget () {
      return this.feature
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToMapEvents()
    }
  }

  const watch = {
    /**
     * @param {string|number} value
     */
    id (value) {
      assertHasFeature(this)
      this.feature.setId(value)
    },
    /**
     * @param {Object} value
     */
    properties (value) {
      assertHasFeature(this)
      this.feature.setProperties(plainProps(value))
    }
  }

  export default {
    name: 'vl-feature',
    mixins: [rxSubs, stubVNode, styleTarget],
    props,
    methods,
    watch,
    stubVNode: {
      attrs () {
        return {
          id: [this.$options.name, this.id].join('-')
        }
      }
    },
    inject: {
      serviceContainer: SERVICE_CONTAINER_KEY
    },
    /**
     * @returns {Object}
     */
    provide () {
      const vm = this

      return {
        [SERVICE_CONTAINER_KEY]: mergeDescriptors(
          {},
          this::styleTarget.provide()[SERVICE_CONTAINER_KEY],
          {
            get feature () { return vm.feature },
            get source () { return vm.source },
            get layer () { return vm.layer },
            get view () { return vm.view },
            get map () { return vm.map }
          }
        )
      }
    },
    created () {
      this::initialize()
    },
    mounted () {
      this::mount()
    },
    destroyed () {
      this::unmount()
      this._feature = undefined
    }
  }

  /**
   * Create feature without inner style applying, feature level style
   * will be applied in the layer level style function.
   * @return {void}
   * @private
   */
  function initialize () {
    /**
     * @type {ol.Feature}
     * @private
     */
    this._feature = geoJson.readFeature({
      id: this.id,
      properties: this.properties
    }, this.view.getProjection())
    this._feature.set('vm', this)
    this::defineAccessors()
  }

  /**
   * @return {void}
   * @private
   */
  function defineAccessors () {
    Object.defineProperties(this, {
      feature: {
        enumerable: true,
        get: this.getFeature
      },
      source: {
        enumerable: true,
        get: () => this.serviceContainer.source
      },
      layer: {
        enumerable: true,
        get: () => this.serviceContainer.layer
      },
      view: {
        enumerable: true,
        get: () => this.serviceContainer.view
      },
      map: {
        enumerable: true,
        get: () => this.serviceContainer.map
      }
    })
  }

  /**
   * @return {void}
   * @private
   */
  function mount () {
    assertHasFeature(this)
    assertHasSource(this)
    assertHasLayer(this)

    this.source.addFeature(this.feature)
    this.feature.set(LAYER_PROP, this.layer.get('id'))
    this.subscribeAll()
  }

  /**
   * @return {void}
   * @private
   */
  function unmount () {
    assertHasFeature(this)
    assertHasSource(this)

    this.unsubscribeAll()

    if (this.source.getFeatureById(this.id)) {
      this.source.removeFeature(this.feature)
      this.feature.unset(LAYER_PROP)
    }
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToMapEvents () {
    assertHasMap(this)
    assertHasView(this)

    const pointerEvents = Observable.fromOlEvent(
      this.map,
      ['click', 'dblclick', 'singleclick'],
      ({ type, pixel, coordinate }) => ({ type, pixel, coordinate })
    ).map(evt => ({
      ...evt,
      coordinate: toLonLat(evt.coordinate, this.view.getProjection())
    }))

    this.subscribeTo(pointerEvents, evt => {
      if (this.isAtPixel(evt.pixel)) {
        this.$emit(evt.type, evt)
      }
    })
  }
</script>
