<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot
      :id="id"
      :properties="properties"
      :geometry="geometry"
      :point="point" />
  </i>
</template>

<script>
  import Feature from 'ol/Feature'
  import { Observable } from 'rxjs'
  import { merge as mergeObs } from 'rxjs/observable'
  import { distinctUntilChanged, map as mapObs, mergeAll } from 'rxjs/operators'
  import { geometryContainer, olCmp, projTransforms, stylesContainer, useMapCmp } from '../../mixin'
  import { findPointOnSurface, getFeatureId, initializeFeature, setFeatureId } from '../../ol-ext'
  import { obsFromOlEvent } from '../../rx-ext'
  import { isEqual, newPlainObject } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  /**
   * A vector object for geographic features with a geometry and other attribute properties,
   * similar to the features in vector file formats like **GeoJSON**.
   */
  export default {
    name: 'VlFeature',
    mixins: [olCmp, useMapCmp, geometryContainer, stylesContainer, projTransforms],
    props: {
      /**
       * All feature properties.
       * @type {Object}
       * @default {}
       */
      properties: {
        type: Object,
        default: newPlainObject,
      },
    },
    computed: {
      /**
       * **GeoJSON** encoded geometry.
       * @type {Object|undefined}
       */
      geometry () {
        if (!(this.rev && this.resolvedDataProjection && this.$geometry)) return

        return this.writeGeometryInDataProj(this.$geometry)
      },
      /**
       * @return {number[]|undefined}
       */
      point () {
        if (!(this.pointViewProj && this.resolvedDataProjection)) return

        return this.pointToDataProj(this.pointViewProj)
      },
      geometryViewProj () {
        if (!(this.rev && this.resolvedDataProjection && this.$geometry)) return

        return this.writeGeometryInViewProj(this.$geometry)
      },
      pointViewProj () {
        if (!(this.rev && this.$geometry)) return

        return findPointOnSurface(this.$geometry)
      },
    },
    watch: {
      /**
       * @param {string|number} value
       */
      id (value) {
        this.setId(value)
      },
      /**
       * @param {Object} value
       */
      properties (value) {
        this.setProperties(value)
      },
    },
    created () {
      this::defineServices()
    },
    methods: {
      /**
       * Create feature without inner style applying, feature level style
       * will be applied in the layer level style function.
       * @return {module:ol/Feature~Feature}
       * @protected
       */
      createOlObject () {
        const feature = new Feature(this.properties)

        initializeFeature(feature, this.id)
        feature.setGeometry(this.$geometry)

        return feature
      },
      /**
       * @return {Promise<string|number>}
       */
      async getId () {
        return getFeatureId(await this.resolveFeature())
      },
      /**
       * @param {string|number} id
       * @return {Promise<void>}
       */
      async setId (id) {
        const feature = await this.resolveFeature()

        if (id === getFeatureId(feature)) return

        setFeatureId(feature, id)
      },
      /**
       * @return {Promise<string>}
       */
      async getGeometryName () {
        return (await this.resolveFeature()).getGeometryName()
      },
      /**
       * @param {string} geometryName
       * @return {Promise<void>}
       */
      async setGeometryName (geometryName) {
        const feature = await this.resolveFeature()

        if (geometryName === feature.getGeometryName()) return

        feature.setGeometryName(geometryName)
      },
      /**
       * @return {Promise<Object>}
       */
      async getProperties () {
        return (await this.resolveFeature()).getProperties()
      },
      /**
       * @param {Object} properties
       * @return {Promise<void>}
       */
      async setProperties (properties) {
        const feature = await this.resolveFeature()

        if (isEqual(properties, feature.getProperties())) return

        feature.setProperties(properties)
      },
      /**
       * Checks if feature lies at `pixel`.
       * @param {number[]} pixel
       * @return {Promise<boolean>}
       */
      async isAtPixel (pixel) {
        const selfFeature = await this.resolveFeature()
        let layerFilter
        if (this.$layerVm) {
          const selfLayer = await this.$layerVm.resolveLayer()
          layerFilter = layer => layer === selfLayer
        }

        return this.$mapVm.forEachFeatureAtPixel(pixel, feature => feature === selfFeature, { layerFilter })
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
            get featureVm () { return vm },
          },
        )
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        if (this.$featuresContainer) {
          await this.$featuresContainer.addFeature(this)
        }

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$featuresContainer) {
          await this.$featuresContainer.removeFeature(this)
        }

        return this::olCmp.methods.unmount()
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        return Promise.all([
          this::olCmp.methods.subscribeAll(),
          this::subscribeToEvents(),
        ])
      },
      resolveFeature: olCmp.methods.resolveOlObject,
      getGeometryTarget: olCmp.methods.resolveOlObject,
      getStyleTarget: olCmp.methods.resolveOlObject,
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $feature: {
        enumerable: true,
        get: () => this.$olObject,
      },
      $geometry: {
        enumerable: true,
        get: () => this.$feature?.getGeometry(),
      },
      $layerVm: {
        enumerable: true,
        get: () => this.$services?.layerVm,
      },
      $mapVm: {
        enumerable: true,
        get: () => this.$services?.mapVm,
      },
      $featuresContainer: {
        enumerable: true,
        get: () => this.$services?.featuresContainer,
      },
    })
  }

  async function subscribeToEvents () {
    const feature = await this.resolveFeature()

    const getPropValue = prop => feature.get(prop)
    // all plain properties + geometry
    const propChanges = obsFromOlEvent(
      feature,
      'propertychange',
      ({ key }) => ({ prop: key, value: getPropValue(key) }),
    )
    // id, style and other generic changes
    const changes = obsFromOlEvent(
      feature,
      'change',
    ).pipe(
      mapObs(() => Observable.create(obs => {
        if (feature.getId() !== this.id) {
          obs.next({ prop: 'id', value: feature.getId() })
        }
        // todo style?
      })),
      mergeAll(),
    )
    // all changes
    const allChanges = mergeObs(propChanges, changes).pipe(
      distinctUntilChanged(isEqual),
    )

    this.subscribeTo(allChanges, ({ prop, value }) => {
      ++this.rev

      this.$nextTick(() => {
        if (prop === 'id') {
          this.$emit(`update:${prop}`, value)
        } else if (prop !== feature.getGeometryName()) {
          this.$emit('update:properties', { ...this.properties, [prop]: value })
        }
      })
    })
  }
</script>
