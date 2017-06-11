<script>
  import Vue from 'vue'
  import Cluster from 'ol/source/cluster'
  import SourceBuilder from './builder'
  import source from '../source'
  import { DATA_PROJ, geom as geomHelper } from '../../../ol-ext'
  import * as assert from '../../../utils/assert'

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
     * @return {Object}
     * @protected
     */
    createSource () {
      const geomFunc = this.geomFunc
      // partial setup of ol.source.Cluster with the help of SourceBuilder class
      // todo проброс ident map в билдер и нормальная подмена для род. миксина
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

      return {}
    },
    /**
     * @return {ol.source.Cluster|undefined}
     */
    getSource () {
      // lazy ol.source.Cluster instantiating
      if (!(this.olObject instanceof Cluster)) {
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
      source = source instanceof Vue ? source.source : source
      this.sourceBuilder.setSource(source)
      // todo check if remount need
    }
  }

  const watch = {
    distance (value) {
      assert.hasSource(this)
      this.source.setDistance(value)
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
   * @returns {ol.geom.Point|undefined}
   */
  function defaultGeomFunc (feature) {
    let geom = feature.getGeometry()
    if (!geom) return

    return geomHelper.pointOnSurface(geom)
  }
</script>
