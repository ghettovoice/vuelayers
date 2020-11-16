<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <InnerSource :id="'vl-' + currentId + '-inner-source'">
      <slot />
    </InnerSource>
  </i>
</template>

<script>
  import { Cluster as ClusterSource, Source } from 'ol/source'
  import { makeChangeOrRecreateWatchers, vectorSource } from '../../mixins'
  import { createPointGeom, findPointOnSurface, getSourceId } from '../../ol-ext'
  import { assert, clonePlainObject, coalesce, isNumber, mergeDescriptors, noop } from '../../utils'
  import InnerSource from './inner-source.vue'

  export default {
    name: 'VlSourceCluster',
    components: {
      InnerSource,
    },
    mixins: [
      vectorSource,
    ],
    props: {
      distance: {
        type: Number,
        default: 20,
      },
      geometryFunction: {
        type: Function,
        // default: defaultGeomFunc,
      },
      /**
       * @deprecated
       * @todo remove later
       */
      geomFunc: Function,
      /**
       * @deprecated Use geomFunc prop instead.
       * @todo remove in v0.13.x
       */
      geomFuncFactory: Function,
    },
    data () {
      return {
        currentDistance: this.distance,
      }
    },
    computed: {
      inputGeometryFunction () {
        let geomFunc = this.geometryFunction || this.geomFunc
        if (!geomFunc && this.geomFuncFactory) {
          geomFunc = this.geomFuncFactory()
        }

        return geomFunc || defaultGeomFunc
      },
      innerSource () {
        if (!(this.rev && this.$innerSource)) return

        return {
          id: getSourceId(this.$innerSource),
          type: this.$innerSource.constructor.name,
        }
      },
      inputUrl: noop,
      inputLoader: noop,
      inputLoadingStrategy: noop,
      formatIdent: noop,
      inputFormatFactory: noop,
    },
    watch: {
      rev () {
        if (!this.$source) return

        if (this.currentDistance !== this.$source.getDistance()) {
          this.currentDistance = this.$source.getDistance()
        }
      },
      distance (value) {
        this.setDistance(value)
      },
      currentDistance (value) {
        if (value === this.distance) return

        this.$emit('update:distance', value)
      },
      innerSource: {
        deep: true,
        handler (value, prev) {
          if (value === prev) return

          this.$emit('update:innerSource', value && clonePlainObject(value))
        },
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'inputGeometryFunction',
      ]),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.geomFuncFactory) {
          this.$logger.warn("'geomFuncFactory' prop is deprecated. Use 'geometryFunction' prop instead.")
        }
        if (this.geomFunc) {
          this.$logger.warn("'geomFunc' prop is deprecated. Use 'geometryFunction' prop instead.")
        }
      }

      this._innerSource = undefined
      this._innerSourceVm = undefined

      this::defineServices()
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.geomFuncFactory) {
          this.$logger.warn("'geomFuncFactory' prop is deprecated. Use 'geometryFunction' prop instead.")
        }
        if (this.geomFunc) {
          this.$logger.warn("'geomFunc' prop is deprecated. Use 'geometryFunction' prop instead.")
        }
      }
    },
    methods: {
      createSource () {
        return new ClusterSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          wrapX: this.wrapX,
          // ol/source/Cluster
          source: this.$innerSource,
          distance: this.currentDistance,
          geometryFunction: this.inputGeometryFunction,
        })
      },
      getServices () {
        const vm = this

        return mergeDescriptors(
          this::vectorSource.methods.getServices(),
          {
            get innerSourceContainer () { return vm },
          },
        )
      },
      getDistance () {
        return coalesce(this.$source?.getDistance(), this.currentDistance)
      },
      setDistance (distance) {
        assert(isNumber(distance), 'Invalid distance')

        if (distance !== this.currentDistance) {
          this.currentDistance = distance
        }
        if (this.$source && distance !== this.$source.getDistance()) {
          this.$source.setDistance(distance)
        }
      },
      getInnerSource () {
        return this._innerSource
      },
      getInnerSourceVm () {
        return this._innerSourceVm
      },
      setInnerSource (innerSource) {
        innerSource = innerSource?.$source || innerSource
        assert(!innerSource || innerSource instanceof Source)
        innerSource || (innerSource = undefined)

        if (innerSource !== this._innerSource) {
          this._innerSource = innerSource
          this._innerSourceVm = innerSource?.vm && innerSource.vm[0]
          this.scheduleRefresh()
        }
        if (this.$source && innerSource !== this.$source.getSource()) {
          this.$source.setSource(innerSource)
          this.scheduleRefresh()
        }
      },
      projectionChanged: noop,
      inputUrlChanged: noop,
      inputLoaderChanged: noop,
      inputLoadingStrategyChanged: noop,
      inputFormatFactoryChanged: noop,
      formatIdentChanged: noop,
      formatChanged: noop,
      overlapsChanged: noop,
      useSpatialIndexChanged: noop,
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $innerSource: {
        enumerable: true,
        get: this.getInnerSource,
      },
      $innerSourceVm: {
        enumerable: true,
        get: this.getInnerSourceVm,
      },
    })
  }

  function defaultGeomFunc (feature) {
    const geometry = feature.getGeometry()
    if (!geometry) return

    const coordinate = findPointOnSurface(geometry)
    if (coordinate) {
      return createPointGeom(coordinate)
    }
  }
</script>
