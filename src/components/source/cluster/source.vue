<script>
  import Vue from 'vue'
  import SourceBuilder from './builder'
  import source from '../source'
  import { EPSG_4326, geom as geomHelper } from '../../../ol-ext'

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
    },
    projection: {
      type: String,
      default: EPSG_4326
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
     * @return {ol.source.Vector|undefined}
     */
    getSource () {
      return this.sourceBuilder && this.sourceBuilder.getSource()
    },
    /**
     * @return {Vue<ol.source.Vector>|undefined}
     */
    getSourceCmp () {
      return this.$children.slice().reverse().find(c => c.hasOwnProperty('source'))
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
      this.source && this.source.setDistance(value)
    }
  }

  export default {
    name: 'vl-source-cluster',
    mixins: [source],
    props,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.$options.name
        }
      }
    }
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
