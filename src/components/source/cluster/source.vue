<script>
  import { geom as geomHelper } from '../../../ol-ext'
  import vectSource from '../vect'
  import sourceContainer from '../../source-container'
  import SourceBuilder from './builder'
  import mergeDescriptors from '../../../utils/multi-merge-descriptors'

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
        this::vectSource.methods.getServices(),
        this::sourceContainer.methods.getServices()
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
    mixins: [vectSource, sourceContainer],
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
      let geometry = feature.getGeometry()
      if (!geometry) return

      return geomHelper.pointOnSurface(geometry)
    }
  }
</script>
