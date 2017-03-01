<script>
  import ol from 'openlayers'
  import uuid from 'node-uuid'
  import rxSubs from 'vuelayers/src/mixins/rx-subs'
  import exposeInject from 'vuelayers/src/mixins/expose-inject'

  const props = {
    id: {
      type: String,
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
        feature: this.feature
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
      }, this.$slots.default)
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

      if (process.env.NODE_ENV !== 'production') {
        console.log('mount feature', this)
      }
    },
    beforeDestroy () {
      this.source.removeFeature(this.feature)

      if (process.env.NODE_ENV !== 'production') {
        console.log('unmount feature', this)
      }
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
