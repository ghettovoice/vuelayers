<template>
  <i :id="id" :class="[$options.name, id].join('-')" style="display: none !important;">
    <slot :id="id" :properties="properties" :geometry="geometry"></slot>
  </i>
</template>

<script>
  import Vue from 'vue'
  import uuid from 'uuid/v4'
  import Feature from 'ol/feature'
  import { isPlainObject, isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/throttleTime'
  import '../../rx-ext'
  import mergeDescriptors from '../../utils/multi-merge-descriptors'
  import plainProps from '../../utils/plain-props'
  import cmp from '../ol-cmp'
  import useMapCmp from '../ol-use-map-cmp'
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

  const computed = {
    geometry () {
      if (this.rev && this.$geometry) {
        return geoJson.writeGeometry(this.$geometry)
      }
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
      feature.setGeometry(this._geometry)

      return feature
    },
    /**
     * @returns {ol.Feature|undefined}
     */
    getFeature () {
      return this.$olObject
    },
    /**
     * @return {ol.geom.Geometry|undefined}
     */
    getGeometry () {
      return this._geometry
    },
    /**
     * @param {ol.geom.Geometry|Vue|GeoJSONGeometry|undefined} geom
     * @return {void}
     * @throws {AssertionError}
     */
    setGeometry (geom) {
      if (geom instanceof Vue) {
        geom = geom.$geometry
      } else if (isPlainObject(geom)) {
        assert.hasView(this)
        geom = geoJson.readGeometry(geom, this.$view.getProjection())
      }
      if (geom !== this._geometry) {
        this._geometry = geom
      }
      if (this.$feature && geom !== this.$feature.getGeometry()) {
        this.$feature.setGeometry(geom)
      }
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(this::cmp.methods.getServices(), {
        get feature () { return vm.$feature }
      })
    },
    /**
     * @return {ol.Feature|undefined}
     * @protected
     */
    getStyleTarget () {
      return this.$feature
    },
    /**
     * @param {number} pixel
     * @return {boolean}
     */
    isAtPixel (pixel) {
      assert.hasMap(this)

      return this.$map.forEachFeatureAtPixel(
        pixel,
        f => f === this.$feature,
        { layerFilter: l => l === this.$layer }
      )
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent && this.$parent.addFeature(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$parent && this.$parent.removeFeature(this)
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToFeatureChanges()
    }
  }

  const watch = {
    /**
     * @param {string|number} value
     */
    id (value) {
      if (this.$feature && value !== this.$feature.getId()) {
        this.$feature.setId(value)
      }
    },
    /**
     * @param {Object} value
     */
    properties (value) {
      this.$feature && this.$feature.setProperties(plainProps(value))
    }
  }

  export default {
    name: 'vl-feature',
    mixins: [cmp, useMapCmp, styleTarget],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      attrs () {
        return {
          id: [this.$options.name, this.id].join('-'),
          class: this.$options.name
        }
      }
    },
    data () {
      return {
        rev: 1
      }
    },
    created () {
      /**
       * @type {ol.geom.Geometry|undefined}
       * @private
       */
      this._geometry = undefined

      Object.defineProperties(this, {
        $featuresContainer: {
          enumerable: true,
          get: this.$services && this.$services.featuresContainer
        },
        $feature: {
          enumerable: true,
          get: this.getFeature
        },
        $layer: {
          enumerable: true,
          get: () => this.$services && this.$services.layer
        },
        $map: {
          enumerable: true,
          get: () => this.$services && this.$services.map
        },
        $view: {
          enumerable: true,
          get: () => this.$services && this.$services.view
        },
        $geometry: {
          enumerable: true,
          get: this.getGeometry
        }
      })
    },
    destroyed () {
      this._geometry = undefined
    }
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToFeatureChanges () {
    assert.hasFeature(this)

    const getPropValue = prop => this.$feature.get(prop)
    const ft = 100
    const events = Observable.fromOlEvent(this.$feature, 'change', ({ key }) => ({ prop: key, value: getPropValue(key) }))
      .throttleTime(ft)
      .distinctUntilChanged(isEqual)

    this.subscribeTo(events, ({ prop, value }) => {
      ++this.rev
      if (prop !== this.$feature.getGeometryName()) {
        this.pr
      }
    })
  }
</script>
