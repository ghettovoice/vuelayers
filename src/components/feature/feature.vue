<script>
  import ol from 'openlayers'
  import uuid from 'node-uuid'
  import rxSubs from 'vuelayers/src/mixins/rx-subs'
  import exposeInject from 'vuelayers/src/mixins/expose-inject'

  const props = {
    id: {
      type: [ String, Number ],
      default: uuid.v4()
    },
    data: Object
  }

  const methods = {
    refresh () {
      this.feature.changed()
    },
    expose () {
      return {
        ...this.$parent.expose(),
        feature: this.feature,
        styleTarget: this.feature
      }
    }
  }

  export default {
    name: 'vl-feature',
    mixins: [ exposeInject, rxSubs ],
    inject: [ 'layer', 'source', 'map', 'view' ],
    props,
    methods,
    render (h) {
      return h('i', {
        style: {
          display: 'none'
        }
      }, [
        ...(this.$slots.default || []),
        ...(this.$slots.style || [])
      ])
    },
    created () {
      /**
       * @type {ol.Feature}
       * @protected
       */
      this.feature = this::createFeature()
      this.feature.vm = this
      this.feature.layer = this.layer
    },
    mounted () {
      this.source.addFeature(this.feature)
    },
    beforeDestroy () {
      this.source.removeFeature(this.feature)
    },
    destroyed () {
      this.feature = undefined
    }
  }

  function createFeature () {
    return new ol.Feature({
      ...this.data,
      id: this.id
    })
  }
</script>

<style>
  /* stub style  */
</style>
