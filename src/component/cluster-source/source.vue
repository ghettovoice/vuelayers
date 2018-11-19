<script>
  import sourceContainer from '../../mixin/source-container'
  import vectorSource from '../../mixin/vector-source'
  import { createPointGeom, findPointOnSurface } from '../../ol-ext/geom'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import SourceBuilder from './builder'

  const props = {
    distance: {
      type: Number,
      default: 20,
    },
    /**
     * Geometry function factory
     * @type {function(): (function(f: ol.Feature): ol.geom.SimpleGeometry|undefined)} geomFuncFactory
     */
    geomFuncFactory: {
      type: Function,
      default: defaultGeomFuncFactory,
    },
  }

  const computed = {
    geomFunc () {
      return this.geomFuncFactory()
    },
  }

  const methods = {
    /**
     * @return {Promise<ol.source.Cluster>}
     * @protected
     */
    createSource () {
      // partial setup of ol.source.Cluster with the help of SourceBuilder class
      /**
       * @type {SourceBuilder}
       * @private
       */
      this._sourceBuilder = new SourceBuilder()
        .setAttributions(this.attributions)
        .setDistance(this.distance)
        .setGeometryFunction(this.geomFunc)
        .setLogo(this.logo)
        .setProjection(this.projection)
        .setWrapX(this.wrapX)

      return this._sourceBuilder.promise()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::vectorSource.methods.getServices(),
        this::sourceContainer.methods.getServices(),
      )
    },
    /**
     * @return {{
     *     setSource: function(ol.source.Source): void,
     *     getSource: function(): ol.source.Source
     *   }|undefined}
     * @protected
     */
    getSourceTarget () {
      return this._sourceBuilder
    },
  }

  const watch = {
    distance (value) {
      if (this.$source && value !== this.$source.getDistance()) {
        this.$source.setDistance(value)
      }
    },
  }

  export default {
    name: 'vl-source-cluster',
    mixins: [vectorSource, sourceContainer],
    props,
    computed,
    methods,
    watch,
  }

  /**
   * @returns {function(f: ol.Feature): ol.geom.SimpleGeometry|undefined}
   */
  function defaultGeomFuncFactory () {
    return function (feature) {
      const geometry = feature.getGeometry()
      if (!geometry) return

      let coordinate = findPointOnSurface(geometry)
      if (coordinate) {
        return createPointGeom(coordinate)
      }
    }
  }
</script>
