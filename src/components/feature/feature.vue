<template>
  <i style="display: none !important;">
    <slot></slot>
  </i>
</template>

<script>
  import ol from 'openlayers'
  import uuid from 'node-uuid'
  import { omit } from 'lodash/fp'
  import rxSubs from 'vuelayers/src/mixins/rx-subs'
  import exposeInject from 'vuelayers/src/mixins/expose-inject'

  const props = {
    id: {
      type: [ String, Number ],
      default: () => uuid.v4()
    },
    data: {
      type: Object,
      default: () => ({})
    }
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
    const feature = new ol.Feature({
      ...omit([ 'geometry' ], this.data),
      id: this.id
    })
    feature.setId(this.id)

    return feature
  }
</script>

<style>
  /* stub style  */
</style>
