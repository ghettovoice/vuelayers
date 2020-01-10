<script>
  import VectorSource from 'ol/source/Vector'
  import { vectorSource } from '../../mixin'
  import { createGeoJsonFmt, getFeatureId, initializeFeature, loadingAll, transform } from '../../ol-ext'
  import { constant, difference, isEqual, isFinite, isFunction, stubArray } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'vl-source-vector',
    mixins: [vectorSource],
    props: {
      /**
       * Array of GeoJSON features with coordinates in the map view projection.
       * @type {Object[]} features
       */
      features: {
        type: Array,
        default: stubArray,
      },
      /**
       * Source loader factory.
       * Source loader should load features from some remote service, decode them and pas to `features` prop to render.
       * @type {(function(): FeatureLoader|undefined)} loaderFactory
       */
      loaderFactory: {
        type: Function,
      },
      /**
       * Source format factory
       * @type {(function(): Feature|undefined)} formatFactory
       */
      formatFactory: {
        type: Function,
        default: defaultFormatFactory,
      },
      /**
       * String or url factory
       * @type {(string|function(): string|FeatureUrlFunction|undefined)} url
       */
      url: [String, Function],
      /**
       * Loading strategy factory.
       * Extent here in map view projection.
       * @type {(function(): LoadingStrategy|undefined)} strategyFactory
       */
      strategyFactory: {
        type: Function,
        default: defaultStrategyFactory,
      },
      overlaps: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      urlFunc () {
        if (!this.url) return

        let url = this.url
        if (!isFunction(url)) {
          url = constant(this.url)
        }

        return (extent, resolution, projection) => {
          extent = transformExtent(extent, projection, this.resolvedDataProjection)
          projection = this.resolvedDataProjection

          return url(extent, resolution, projection)
        }
      },
      loaderFunc () {
        if (!this.loaderFactory) return

        const loader = this.loaderFactory()

        return async (extent, resolution, projection) => {
          let features = await loader(
            transformExtent(extent, projection, this.resolvedDataProjection),
            resolution,
            this.resolvedDataProjection,
          )
          if (!Array.isArray(features)) {
            features = this.readSourceData(features)
          }
          if (Array.isArray(features)) {
            this.addFeatures(features)
          }
        }
      },
      loadingStrategy () {
        return this.strategyFactory()
      },
      dataFormatIdent () {
        if (!this.olObjIdent) return

        return this.makeIdent(this.olObjIdent, 'data_format')
      },
      dataFormat () {
        return this.instanceFactoryCall(this.dataFormatIdent, ::this.formatFactory)
      },
    },
    methods: {
      /**
       * @return {VectorSource}
       * @protected
       */
      createSource () {
        return new VectorSource({
          attributions: this.attributions,
          features: this.$featuresCollection,
          projection: this.resolvedDataProjection,
          loader: this.loaderFunc,
          useSpatialIndex: this.useSpatialIndex,
          wrapX: this.wrapX,
          logo: this.logo,
          strategy: this.loadingStrategy,
          format: this.dataFormat,
          url: this.urlFunc,
          overlaps: this.overlaps,
        })
      },
      /**
       * @return {void}
       * @protected
       */
      mount () {
        this::vectorSource.methods.mount()
        this.addFeatures(this.features)
      },
      /**
       * @return {void}
       * @protected
       */
      unmount () {
        this.clear()
        this::vectorSource.methods.unmount()
      },
      /**
       * @param {mixed} data
       * @returns {Array<FeatureLike>|Array<Feature>}
       */
      readSourceData (data) {
        return this.dataFormat.readFeatures(data, {
          featureProjection: this.viewProjection,
          dataProjection: this.resolvedDataProjection,
        })
      },
    },
    watch: {
      features: {
        deep: true,
        handler (features) {
          if (!this.$source || isEqual(features, this.featuresDataProj)) return
          // add new features
          features.forEach(feature => {
            feature = initializeFeature({ ...feature })
            this.addFeature(feature)
          })
          // remove non-matched features
          difference(
            this.getFeatures(),
            features,
            (a, b) => getFeatureId(a) === getFeatureId(b)
          ).forEach(::this.removeFeature)
        },
      },
      ...makeWatchers([
        'loadingStrategy',
        'dataFormat',
        'urlFunc',
        'loaderFactory',
        'formatFactory',
        'strategyFactory',
        'overlaps',
      ], () => function () {
        this.scheduleRecreate()
      }),
    },
  }

  /**
   * @return {LoadingStrategy}
   */
  function defaultStrategyFactory () {
    return loadingAll
  }

  /**
   * @return {GeoJSON}
   */
  function defaultFormatFactory () {
    return createGeoJsonFmt()
  }

  function transformExtent (extent, sourceProj, destProj) {
    extent = extent.slice()
    if (isFinite(extent[0]) && isFinite(extent[1])) {
      [extent[0], extent[1]] = transform([extent[0], extent[1]], sourceProj, destProj)
    }
    if (isFinite(extent[2]) && isFinite(extent[3])) {
      [extent[2], extent[3]] = transform([extent[2], extent[3]], sourceProj, destProj)
    }
    return extent
  }
</script>
