<template>
  <i :id="id" :class="[$options.name, id].join('-')" style="display: none !important;">
    <slot :id="id" :properties="properties" :geometry="geometry"></slot>
  </i>
</template>

<script>
  import uuid from 'uuid/v4'
  import Feature from 'ol/feature'
  import { isEqual, merge } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/merge'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/map'
  import 'rxjs/add/operator/mergeAll'
  import '../../rx-ext'
  import mergeDescriptors from '../../utils/multi-merge-descriptors'
  import plainProps from '../../utils/plain-props'
  import cmp from '../ol-cmp'
  import useMapCmp from '../use-map-cmp'
  import stylesContainer from '../styles-container'
  import geometryContainer from '../geometry-container'
  import { geoJson } from '../../ol-ext'
  import * as assert from '../../utils/assert'

  const mergeNArg = merge.convert({ fixed: false })

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
        this::cmp.methods.getServices(),
        this::geometryContainer.methods.getServices(),
        this::stylesContainer.methods.getServices(),
        {
          get feature () { return vm.$feature }
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
      value = plainProps(value)
      if (this.$feature && !isEqual(value, plainProps(this.$feature.getProperties()))) {
        this.$feature.setProperties(plainProps(value))
      }
    }
  }

  export default {
    name: 'vl-feature',
    mixins: [cmp, useMapCmp, geometryContainer, stylesContainer],
    props,
    computed,
    methods,
    watch,
    data () {
      return {
        rev: 1
      }
    },
    created () {
      Object.defineProperties(this, {
        /**
         * @type {ol.Feature|undefined}
         */
        $feature: {
          enumerable: true,
          get: () => this.$olObject
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
        $featuresContainer: {
          enumerable: true,
          get: this.$services && this.$services.featuresContainer
        }
      })
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
    // all plain properties
    const propChanges = Observable.fromOlEvent(
      this.$feature,
      'propertychange',
      ({ key }) => ({ prop: key, value: getPropValue(key) })
    ).throttleTime(ft)
      .distinctUntilChanged(isEqual)
    // id, style and other generic changes
    const changes = Observable.fromOlEvent(
      this.$feature,
      'change'
    ).map(() => Observable.create(obs => {
      if (this.$feature.getId() !== this.id) {
        obs.next({ prop: 'id', value: this.$feature.getId() })
      }
      // todo style?
    })).mergeAll()
      .throttleTime(ft)
      .distinctUntilChanged(isEqual)
    // all changes
    const allChanges = Observable.merge(
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
