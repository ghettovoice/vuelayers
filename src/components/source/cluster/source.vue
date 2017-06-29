<script>
  import Vue from 'vue'
  import SourceBuilder from './builder'
  import vectSource from '../vect'
  import { geom as geomHelper } from '../../../ol-ext'

  // todo make inherit from vector
  const props = {
    distance: {
      type: Number,
      default: 20
    },
    /**
     * @type {function(feature: ol.Feature): (ol.geom.Point|undefined)}
     */
    geomFunc: {
      type: Function,
      default: defaultGeomFunc
    }
  }

  const methods = {
    /**
     * @return {Promise<ol.source.Cluster>}
     * @protected
     */
    createSource () {
      const geomFunc = this.geomFunc
      // partial setup of ol.source.Cluster with the help of SourceBuilder class
      /**
       * @type {SourceBuilder}
       * @private
       */
      this.sourceBuilder = new SourceBuilder()
        .setAttributions(this.attributions)
        .setDistance(this.distance)
        .setGeometryFunction(function __geomFunc (feature) {
          return geomFunc(feature, geomHelper)
        })
        .setLogo(this.logo)
        .setProjection(this.projection)
        .setWrapX(this.wrapX)

      return this.sourceBuilder.promise()
    },
    /**
     * Returns inner wrapped vector source
     * @return {ol.source.Vector|undefined}
     */
    getInnerSource () {
      return this.sourceBuilder && this.sourceBuilder.getSource()
    },
    /**
     * Set inner vector source
     * @param {ol.source.Vector|Vue|undefined} source
     * @return {void}
     */
    setSource (source) {
      source = source instanceof Vue ? source.source : source
      if (source !== this.sourceBuilder.getSource()) {
        this.sourceBuilder.setSource(source)
      }
    }
  }

  const watch = {
    distance (value) {
      if (this.source && value !== this.source.getDistance()) {
        this.source.setDistance(value)
      }
    }
  }

  export default {
    name: 'vl-source-cluster',
    mixins: [vectSource],
    props,
    methods,
    watch
  }

  /**
   * @param {ol.Feature} feature
   * @param {Object} h
   * @returns {ol.geom.Point|undefined}
   */
  function defaultGeomFunc (feature, { pointOnSurface }) {
    let geom = feature.getGeometry()
    if (!geom) return

    return pointOnSurface(geom)
  }
</script>
