<script>
  import debounce from 'debounce-promise'
  import { Cluster as ClusterSource } from 'ol/source'
  import { FRAME_TIME, createSourceContainer, vectorSource } from '../../mixin'
  import { createPointGeom, findPointOnSurface } from '../../ol-ext'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  const sourceContainer = createSourceContainer({
    propName: 'innerSource',
  })

  export default {
    name: 'VlSourceCluster',
    mixins: [
      sourceContainer,
      vectorSource,
    ],
    props: {
      distance: {
        type: Number,
        default: 20,
      },
      geomFunc: {
        type: Function,
        // default: defaultGeomFunc,
      },
      /**
       * @deprecated Use geomFunc prop instead.
       * @todo remove in v0.13.x
       */
      geomFuncFactory: Function,
    },
    computed: {
      resolvedGeomFunc () {
        let geomFunc = this.geomFunc
        if (!geomFunc && this.geomFuncFactory) {
          geomFunc = this.geomFuncFactory()
        }

        return geomFunc || defaultGeomFunc
      },
      currentDistance () {
        if (this.rev && this.$source) {
          return this.$source.getDistance()
        }

        return this.distance
      },
    },
    watch: {
      async distance (value) {
        await this.setDistance(value)
      },
      currentDistance: debounce(function (value) {
        if (value === this.distance) return

        this.$emit('update:distance', value)
      }, FRAME_TIME),
      ...makeWatchers([
        'resolvedGeomFunc',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.geomFuncFactory) {
          this.$logger.warn("'geomFuncFactory' prop is deprecated. Use 'geomFunc' prop instead.")
        }
      }
    },
    updated () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.geomFuncFactory) {
          this.$logger.warn("'geomFuncFactory' prop is deprecated. Use 'geomFunc' prop instead.")
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
          geometryFunction: this.resolvedGeomFunc,
        })
      },
      getServices () {
        return mergeDescriptors(
          this::vectorSource.methods.getServices(),
          this::sourceContainer.methods.getServices(),
        )
      },
      getSourceTarget: vectorSource.methods.resolveOlObject,
      async getDistance () {
        return (await this.resolveSource()).getDistance()
      },
      async setDistance (distance) {
        if (distance === await this.getDistance()) return

        (await this.resolveSource()).setDistance(distance)
      },
    },
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
