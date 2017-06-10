<script>
  import Vue from 'vue'
  import SourceBuilder from './builder'
  import source from '../source'
  import { DATA_PROJ, geom as geomHelper } from '../../../ol-ext'
  import { assertHasSource } from '../../../utils/assert'

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
      default: DATA_PROJ
    }
  }

  const methods = {
    /**
     * @return {null}
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

      return null
    },
    /**
     * @return {ol.source.Cluster|undefined}
     */
    getSource () {
      // lazy ol.source.Cluster instantiating
      if (!this.olObject) {
        this.olObject = this.sourceBuilder.build()
      }

      return this.olObject
    },
    /**
     * Set inner vector source
     * @param {ol.source.Vector|Vue|undefined} source
     * @return {void}
     */
    setSource (source) {
      assertHasSource(this)

      source = source instanceof Vue ? source.source : source
      this.source.setSource(source)
      // todo check if remount need
    }
  }

  const watch = {
    distance (value) {
      assertHasSource(this)
      this.source.setDistance(value)
    }
  }

  export default {
    name: 'vl-source-cluster',
    mixins: [source],
    props,
    methods,
    watch
  }

  /**
   * @param {ol.Feature} feature
   * @returns {ol.geom.Point|undefined}
   */
  function defaultGeomFunc (feature) {
    let geom = feature.getGeometry()
    if (!geom) return

    return geomHelper.pointOnSurface(geom)
  }
</script>
