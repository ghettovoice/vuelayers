<template>
  <i :id="[$options.name, id].join('-')" :class="[$options.name]" style="display: none !important;">
    <slot :id="id" :properties="properties" :geometry="geometry" :point="point"/>
  </i>
</template>

<script>
  import Feature from 'ol/Feature'
  import uuid from 'uuid/v4'
  import { Observable } from 'rxjs'
  import { merge as mergeObs } from 'rxjs/observable'
  import { distinctUntilChanged, map as mapObs, mergeAll, throttleTime } from 'rxjs/operators'
  import { geometryContainer, olCmp, projTransforms, stylesContainer, useMapCmp } from '../../mixin'
  import { findPointOnSurface, initializeFeature } from '../../ol-ext'
  import { observableFromOlEvent } from '../../rx-ext'
  import { hasFeature, hasMap } from '../../util/assert'
  import { isEqual, plainProps } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  /**
   * A vector object for geographic features with a geometry and other attribute properties,
   * similar to the features in vector file formats like **GeoJSON**.
   */
  export default {
    name: 'vl-feature',
    mixins: [olCmp, useMapCmp, geometryContainer, stylesContainer, projTransforms],
    props: {
      /**
       * Feature identifier.
       * @type {string|number}
       * @default UUID
       */
      id: {
        type: [String, Number],
        default: () => uuid(),
      },
      /**
       * All feature properties.
       * @type {Object}
       * @default {}
       */
      properties: {
        type: Object,
        default: () => Object.create(null),
      },
    },
    computed: {
      /**
       * **GeoJSON** encoded geometry.
       * @type {Object|undefined}
       */
      geometry () {
        if (this.rev && this.resolvedDataProjection && this.$geometry) {
          return this.writeGeometryInDataProj(this.$geometry)
        }
      },
      /**
       * @return {number[]|undefined}
       */
      point () {
        if (this.pointViewProj && this.resolvedDataProjection) {
          return this.pointToDataProj(this.pointViewProj)
        }
      },
      geometryViewProj () {
        if (this.rev && this.resolvedDataProjection && this.$geometry) {
          return this.writeGeometryInViewProj(this.$geometry)
        }
      },
      pointViewProj () {
        if (this.rev && this.$geometry) {
          return findPointOnSurface(this.$geometry)
        }
      },
    },
    methods: {
      /**
       * Create feature without inner style applying, feature level style
       * will be applied in the layer level style function.
       * @return {module:ol/Feature~Feature}
       * @protected
       */
      createOlObject () {
        let feature = new Feature(this.properties)

        initializeFeature(feature, this.id)
        feature.setGeometry(this.$geometry)

        return feature
      },
      /**
       * @return {{
       *     getGeometry: function(): (module:ol/geom/Geometry~Geometry|undefined),
       *     setGeometry: function((module:ol/geom/Geometry~Geometry|undefined)): void
       *   }|Feature|undefined}
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
          },
        )
      },
      /**
       * @return {module:ol/Feature~Feature|undefined}
       * @protected
       */
      getStyleTarget () {
        return this.$feature
      },
      /**
       * Checks if feature lies at `pixel`.
       * @param {number[]} pixel
       * @return {boolean}
       */
      isAtPixel (pixel) {
        hasMap(this)

        return this.$map.forEachFeatureAtPixel(
          pixel,
          f => f === this.$feature,
          { layerFilter: l => l === this.$layer },
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
        this::subscribeToEvents()
      },
    },
    watch: {
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
    },
    created () {
      this::defineServices()
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      /**
       * Reference to `ol.Feature` instance.
       * @type {module:ol/Feature~Feature|undefined}
       */
      $feature: {
        enumerable: true,
        get: () => this.$olObject,
      },
      /**
       * Reference to parent `Layer` instance.
       * @type {module:ol/layer/Layer|undefined}
       */
      $layer: {
        enumerable: true,
        get: () => this.$services && this.$services.layer,
      },
      /**
       * Reference to `ol.Map` instance.
       * @type {module:ol/Map|undefined}
       */
      $map: {
        enumerable: true,
        get: () => this.$services && this.$services.map,
      },
      /**
       * Reference to `ol.View` instance.
       * @type {module:ol/View|undefined}
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
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToEvents () {
    hasFeature(this)

    const getPropValue = prop => this.$feature.get(prop)
    const ft = 100
    // all plain properties
    const propChanges = observableFromOlEvent(
      this.$feature,
      'propertychange',
      ({ key }) => ({ prop: key, value: getPropValue(key) }),
    ).pipe(
      throttleTime(ft),
      distinctUntilChanged(isEqual),
    )
    // id, style and other generic changes
    const changes = observableFromOlEvent(
      this.$feature,
      'change',
    ).pipe(
      mapObs(() => Observable.create(obs => {
        if (this.$feature.getId() !== this.id) {
          obs.next({ prop: 'id', value: this.$feature.getId() })
        }
        // todo style?
      })),
      mergeAll(),
      throttleTime(ft),
      distinctUntilChanged(isEqual),
    )
    // all changes
    const allChanges = mergeObs(propChanges, changes)

    this.subscribeTo(allChanges, ({ prop, value }) => {
      ++this.rev

      if (prop === 'id') {
        this.$emit(`update:${prop}`, value)
      } else if (prop !== this.$feature.getGeometryName()) {
        this.$emit('update:properties', Object.assign({}, this.properties, { [prop]: value }))
      }
    })
  }
</script>
