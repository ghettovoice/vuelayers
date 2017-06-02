<script type="text/babel">
  import Vue from 'vue'
  import uuid from 'uuid/v4'
  import Feature from 'ol/feature'
  import { isPlainObject } from 'lodash/fp'
  import { VM_PROP } from '../../consts'
  import mergeDescriptors from '../../utils/multi-merge-descriptors'
  import plainProps from '../../utils/plain-props'
  import rxSubs from '../rx-subs'
  import stubVNode from '../stub-vnode'
  import styleTarget from '../style-target'
  import services from '../services'
  import { geoJson } from '../../ol-ext'
  import { assertHasFeature, assertHasMap } from '../../utils/assert'

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
      assertHasMap(this)

      const cb = feature => feature === this
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
    /**
     * @param {ol.geom.Geometry|Vue|GeoJSONGeometry|undefined} geom
     * @return {void}
     */
    setGeometry (geom) {
      assertHasMap(this)
      assertHasFeature(this)

      if (geom instanceof Vue) {
        geom = geom.geom
      } else if (isPlainObject(geom)) {
        geom = geoJson.readGeometry(geom, this.map.view.getProjection())
      }
      this.feature.setGeometry(geom)
    },
    // protected & private
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(this::services.methods.getServices(), {
        feature: this
      })
    },
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
    mixins: [rxSubs, stubVNode, services, styleTarget],
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
    this._feature = new Feature({
      id: this.id,
      properties: this.properties,
      [VM_PROP]: this
    })
    this._feature.setId(this.id)
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
      layer: {
        enumerable: true,
        get: () => this.services && this.services.layer
      },
      map: {
        enumerable: true,
        get: () => this.services && this.services.map
      }
    })
  }

  /**
   * @return {void}
   * @private
   */
  function mount () {
    this.$parent.addFeature(this)
    this.subscribeAll()
  }

  /**
   * @return {void}
   * @private
   */
  function unmount () {
    this.unsubscribeAll()
    this.$parent.removeFeature(this)
  }
</script>
