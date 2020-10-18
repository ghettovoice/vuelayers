<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <InnerSource :id="'vl-' + id + '-inner-source'">
      <slot />
    </InnerSource>
  </i>
</template>

<script>
  import debounce from 'debounce-promise'
  import { Cluster as ClusterSource } from 'ol/source'
  import { FRAME_TIME, vectorSource } from '../../mixins'
  import { createPointGeom, findPointOnSurface, getSourceId } from '../../ol-ext'
  import { clonePlainObject, isEqual, isFunction, makeWatchers, mergeDescriptors, sequential } from '../../utils'
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
      currentDistance () {
        if (this.rev && this.$source) {
          return this.getDistanceInternal()
        }

        return this.distance
      },
      resolvedGeomFunc () {
        let geomFunc = this.geomFunc
        if (!geomFunc && this.geomFuncFactory) {
          geomFunc = this.geomFuncFactory()
        }

        return geomFunc || defaultGeomFunc
      },
      currentInnerSource () {
        if (!(this.rev && this.$innerSource)) return

        return getSourceId(this.$innerSource)
      },
    },
    watch: {
      distance: /*#__PURE__*/sequential(async function (value) {
        await this.setDistance(value)
      }),
      currentDistance: /*#__PURE__*/ debounce(function (value) {
        if (value === this.distance) return

        this.$emit('update:distance', value)
      }, FRAME_TIME),
      currentInnerSource: debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:innerSource', value && clonePlainObject(value))
      }, FRAME_TIME),
      .../*#__PURE__*/makeWatchers([
        'resolvedGeomFunc',
      ], prop => /*#__PURE__*/sequential(async function (val, prev) {
        if (isEqual(val, prev)) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      })),
    },
    created () {
      if (process.env.NODE_ENV !== 'production') {
        if (this.geomFuncFactory) {
          this.$logger.warn("'geomFuncFactory' prop is deprecated. Use 'geomFunc' prop instead.")
        }
      }

      this._innerSource = null
      this._innerSourceVm = null

      this::defineServices()
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
        const vm = this

        return mergeDescriptors(
          this::vectorSource.methods.getServices(),
          {
            get innerSourceContainer () { return vm },
          },
        )
      },
      getSourceTarget: vectorSource.methods.resolveOlObject,
      async getDistance () {
        await this.resolveSource()

        return this.getDistanceInternal()
      },
      getDistanceInternal () {
        return this.$source.getDistance()
      },
      async setDistance (distance) {
        if (distance === await this.getDistance()) return

        (await this.resolveSource()).setDistance(distance)
      },
      getInnerSource () {
        return this._innerSource
      },
      getInnerSourceVm () {
        return this._innerSourceVm
      },
      async setInnerSource (innerSource) {
        if (isFunction(innerSource?.resolveOlObject)) {
          innerSource = await innerSource.resolveOlObject()
        }
        innerSource || (innerSource = null)

        if (innerSource === this._innerSource) return

        this._innerSource = innerSource
        this._innerSourceVm = innerSource?.vm && innerSource.vm[0]
        const source = await this.resolveSource()
        source.setSource(innerSource)
      },
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
