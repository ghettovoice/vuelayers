<script type="text/babel">
  import Vue from 'vue'
  import uuid from 'uuid/v4'
  import Feature from 'ol/feature'
  import { isPlainObject } from 'lodash/fp'
  import mergeDescriptors from '../../utils/multi-merge-descriptors'
  import plainProps from '../../utils/plain-props'
  import cmp from '../ol-virt-cmp'
  import styleTarget from '../style-target'
  import { geoJson } from '../../ol-ext'
  import * as assert from '../../utils/assert'

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
     * Create feature without inner style applying, feature level style
     * will be applied in the layer level style function.
     * @return {ol.Feature}
     * @protected
     */
    createOlObject () {
      /**
       * @type {ol.Feature}
       * @private
       */
      let feature = new Feature(this.properties)
      feature.setId(this.id)

      return feature
    },
    /**
     * @return {void}
     * @protected
     */
    defineAccessors () {
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
    },
    /**
     * @returns {ol.Feature|undefined}
     */
    getFeature () {
      return this.olObject
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(this::cmp.methods.getServices(), {
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
     * @param {number} pixel
     * @return {boolean}
     */
    isAtPixel (pixel) {
      assert.hasMap(this)

      return this.map.forEachFeatureAtPixel(
        pixel,
        f => f === this.feature,
        { layerFilter: l => l === this.layer }
      )
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent.addFeature(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$parent.removeFeature(this)
    },
    /**
     * @return {void}
     */
    refresh () {
      assert.hasFeature(this)
      this.feature.changed()
    },
    /**
     * @param {ol.geom.Geometry|Vue|GeoJSONGeometry|undefined} geom
     * @return {void}
     */
    setGeometry (geom) {
      assert.hasMap(this)
      assert.hasFeature(this)

      if (geom instanceof Vue) {
        geom = geom.geom
      } else if (isPlainObject(geom)) {
        geom = geoJson.readGeometry(geom, this.map.view.getProjection())
      }
      this.feature.setGeometry(geom)
    }
  }

  const watch = {
    /**
     * @param {string|number} value
     */
    id (value) {
      this.feature && this.feature.setId(value)
    },
    /**
     * @param {Object} value
     */
    properties (value) {
      this.feature && this.feature.setProperties(plainProps(value))
    }
  }

  export default {
    name: 'vl-feature',
    mixins: [cmp, styleTarget],
    props,
    methods,
    watch,
    stubVNode: {
      attrs () {
        return {
          id: [this.$options.name, this.id].join('-')
        }
      }
    }
  }
</script>
