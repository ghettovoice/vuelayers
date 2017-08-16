<script>
  import Vue from 'vue'
  import SourceBuilder from './builder'
  import vectSource from '../vect'
  import * as olExt from '../../../ol-ext'

  const props = {
    distance: {
      type: Number,
      default: 20
    },
    /**
     * Geometry function factory
     * @type {function(olExt: Object): (function(f: ol.Feature): ol.geom.SimpleGeometry|undefined)} geomFuncFactory
     */
    geomFuncFactory: {
      type: Function,
      default: defaultGeomFuncFactory
    }
  }

  const computed = {
    geomFunc () {
      return this.geomFuncFactory(olExt)
    }
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
     * Returns inner wrapped vector source
     * @return {ol.source.Vector|undefined}
     */
    getInnerSource () {
      return this._sourceBuilder && this._sourceBuilder.getSource()
    },
    /**
     * Set inner vector source
     * @param {ol.source.Vector|Vue|undefined} source
     * @return {void}
     */
    setSource (source) {
      source = source instanceof Vue ? source.$source : source
      if (source !== this._sourceBuilder.getSource()) {
        this._sourceBuilder.setSource(source)
      }
    }
  }

  const watch = {
    distance (value) {
      if (this.$source && value !== this.$source.getDistance()) {
        this.$source.setDistance(value)
      }
    }
  }

  export default {
    name: 'vl-source-cluster',
    mixins: [vectSource],
    props,
    computed,
    methods,
    watch
  }

  /**
   * @param {Object} olExt
   * @returns {function(f: ol.Feature): ol.geom.SimpleGeometry|undefined}
   */
  function defaultGeomFuncFactory (olExt) {
    return function (feature) {
      let geometry = feature.getGeometry()
      if (!geometry) return

      return olExt.geom.pointOnSurface(geometry)
    }
  }
</script>
