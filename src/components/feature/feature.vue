<template>
  <i :id="[$options.name, id].join('-')" :class="[$options.name]" style="display: none !important;">
    <slot :id="id" :properties="properties" :geometry="geometry"></slot>
  </i>
</template>

<script>
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

  const props = {
    id: {
      type: [String, Number],
      default: () => uuid(),
    },
    properties: {
      type: Object,
      default: () => Object.create(null),
    },
  }

  const computed = {
    geometry () {
      if (this.rev && this.$geometry && this.$view) {
        return geoJsonHelper.writeGeometry(this.$geometry, this.$view.getProjection())
      }
    },
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
      feature.setGeometry(this.$geometry)

      return feature
    },
    /**
     * @return {{
     *     getGeometry: function(): ol.geom.Geometry|undefined,
     *     setGeometry: function(ol.geom.Geometry|undefined)
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

  export default {
    name: 'vl-feature',
    mixins: [olCmp, useMapCmp, geometryContainer, stylesContainer],
    props,
    computed,
    methods,
    watch,
    data () {
      return {
        rev: 1,
      }
    },
    created () {
      Object.defineProperties(this, {
        /**
         * @type {ol.Feature|undefined}
         */
        $feature: {
          enumerable: true,
          get: () => this.$olObject,
        },
        $layer: {
          enumerable: true,
          get: () => this.$services && this.$services.layer,
        },
        $map: {
          enumerable: true,
          get: () => this.$services && this.$services.map,
        },
        $view: {
          enumerable: true,
          get: () => this.$services && this.$services.view,
        },
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
