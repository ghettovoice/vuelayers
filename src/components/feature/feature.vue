<template>
  <i :id="[$options.name, id].join('-')" :class="[$options.name]" style="display: none !important;">
    <slot :id="id" :properties="properties" :geometry="geometry"></slot>
  </i>
</template>

<script>
  /**
   * @module feature/feature
   */
  import uuid from 'uuid/v4'
  import Feature from 'ol/feature'
  import { isEqual, merge } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import { merge as mergeObs } from 'rxjs/observable/merge'
  import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged'
  import { throttleTime } from 'rxjs/operator/throttleTime'
  import { map as mapObs } from 'rxjs/operator/map'
  import { mergeAll } from 'rxjs/operator/mergeAll'
  import {
    geoJsonHelper,
    mergeDescriptors,
    plainProps,
    assert,
    olCmp,
    useMapCmp,
    stylesContainer,
    geometryContainer,
    observableFromOlEvent,
  } from '../../core'

  const mergeNArg = merge.convert({ fixed: false })

  /**
   * @vueProps
   */
  const props = /** @lends module:feature/feature# */{
    /**
     * Feature identifier.
     * @default UUID
     * @vueSync
     */
    id: {
      type: [String, Number],
      default: () => uuid(),
    },
    /**
     * All feature properties.
     * @default {}
     * @vueSync
     */
    properties: {
      type: Object,
      default: () => Object.create(null),
    },
  }

  /**
   * @vueComputed
   */
  const computed = /** @lends module:feature/feature# */{
    /**
     * **GeoJSON** encoded geometry.
     * @type {GeoJSONFeature|undefined}
     */
    geometry () {
      if (this.rev && this.$geometry && this.$view) {
        return geoJsonHelper.writeGeometry(this.$geometry, this.$view.getProjection())
      }
    },
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:feature/feature# */{
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
      feature.setGeometry(this.$geometry)

      return feature
    },
    /**
     * @return {{
     *     getGeometry: function(): (ol.geom.Geometry|undefined),
     *     setGeometry: function((ol.geom.Geometry|undefined)): void
     *   }|ol.Feature|undefined}
     * @protected
     */
    getGeometryTarget () {
      return this.$feature
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::olCmp.methods.getServices(),
        this::geometryContainer.methods.getServices(),
        this::stylesContainer.methods.getServices(),
        {
          get feature () { return vm.$feature },
        }
      )
    },
    /**
     * @return {ol.Feature|undefined}
     * @protected
     */
    getStyleTarget () {
      return this.$feature
    },
    /**
     * Checks if feature lies at `pixel`.
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
      this.$featuresContainer && this.$featuresContainer.addFeature(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$featuresContainer && this.$featuresContainer.removeFeature(this)
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToFeatureChanges()
    },
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
      value = plainProps(value)
      if (this.$feature && !isEqual(value, plainProps(this.$feature.getProperties()))) {
        this.$feature.setProperties(plainProps(value))
      }
    },
  }

  /**
   * A vector object for geographic features with a geometry and other attribute properties,
   * similar to the features in vector file formats like **GeoJSON**.
   *
   * @title vl-feature
   * @alias module:feature/feature
   * @vueProto
   *
   * @vueSlot default [scoped] Default **scoped** slot with current feature state: `id`, `properties`, GeoJSON `geometry`.
   */
  export default {
    name: 'vl-feature',
    mixins: [olCmp, useMapCmp, geometryContainer, stylesContainer],
    props,
    computed,
    methods,
    watch,
    created () {
      Object.defineProperties(this, /** @lends module:feature/feature# */{
        /**
         * Reference to `ol.Feature` instance.
         * @type {ol.Feature|undefined}
         */
        $feature: {
          enumerable: true,
          get: () => this.$olObject,
        },
        /**
         * Reference to parent `ol.Layer` instance.
         * @type {ol.layer.Layer|undefined}
         */
        $layer: {
          enumerable: true,
          get: () => this.$services && this.$services.layer,
        },
        /**
         * Reference to `ol.Map` instance.
         * @type {ol.Map|undefined}
         */
        $map: {
          enumerable: true,
          get: () => this.$services && this.$services.map,
        },
        /**
         * Reference to `ol.View` instance.
         * @type {ol.View|undefined}
         */
        $view: {
          enumerable: true,
          get: () => this.$services && this.$services.view,
        },
        /**
         * Reference to `featuresContainer`.
         * @type {Object|undefined}
         */
        $featuresContainer: {
          enumerable: true,
          get: () => this.$services && this.$services.featuresContainer,
        },
      })
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToFeatureChanges () {
    assert.hasFeature(this)

    const getPropValue = prop => this.$feature.get(prop)
    const ft = 100
    // all plain properties
    const propChanges = observableFromOlEvent(
      this.$feature,
      'propertychange',
      ({ key }) => ({ prop: key, value: getPropValue(key) })
    )::throttleTime(ft)
      ::distinctUntilChanged(isEqual)
    // id, style and other generic changes
    const changes = observableFromOlEvent(
      this.$feature,
      'change'
    )::mapObs(() => Observable.create(obs => {
      if (this.$feature.getId() !== this.id) {
        obs.next({ prop: 'id', value: this.$feature.getId() })
      }
      // todo style?
    }))::mergeAll()
      ::throttleTime(ft)
      ::distinctUntilChanged(isEqual)
    // all changes
    const allChanges = Observable::mergeObs(
      propChanges,
      changes
    )

    this.subscribeTo(allChanges, ({ prop, value }) => {
      ++this.rev

      if (prop === 'id') {
        this.$emit(`update:${prop}`, value)
      } else if (prop !== this.$feature.getGeometryName()) {
        this.$emit('update:properties', mergeNArg({}, this.properties, { prop: value }))
      }
    })
  }
</script>
