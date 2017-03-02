<template>
  <i style="display: none !important;">
    <slot :feature="plain"></slot>
  </i>
</template>

<script rel>
  /**
   * Wrapper around ol.Feature.
   */
  import ol from 'openlayers'
  import uuid from 'node-uuid'
  import { omit } from 'lodash/fp'
  import rxSubs from 'vl-mixins/rx-subs'
  import exposeInject from 'vl-mixins/expose-inject'

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

  const computed = {
    plain () {
      return {
        ...this.$data,
        ...this.$props,
        layer: this.layer.vm.id
      }
    }
  }

  const methods = {
    refresh () {
      this.feature.changed()
    },
    /**
     * @return {{setStyle: function, getStyle: function}}
     * @protected
     */
    getStyleTarget () {
      return {
        setStyle: this::setStyle,
        getStyle: this::getStyle
      }
    },
    expose () {
      return Object.assign(this.$parent.expose(), {
        feature: this.feature,
        styleTarget: this.getStyleTarget()
      })
    }
  }

  const watch = {
    id (value) {
      this.feature.setId(value)
    },
    data (value) {
      this.feature.setProperties(omit([ 'geometry' ], value))
    }
  }

  export default {
    name: 'vl-feature',
    mixins: [ exposeInject, rxSubs ],
    inject: [ 'layer', 'source', 'map', 'view' ],
    props,
    methods,
    watch,
    computed,
    created () {
      this::createFeature()
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

  /**
   * Create feature without inner style applying, feature level style
   * will be applied in the layer level style function.
   *
   * @return {ol.Feature}
   */
  function createFeature () {
    /**
     * @type {ol.Feature}
     * @protected
     */
    this.feature = new ol.Feature(omit([ 'geometry' ], this.data))
    this.feature.setId(this.id)
    this.feature.vm = this
    this.feature.layer = this.layer

    return this.feature
  }

  function setStyle (style) {
    this.styles = style

    if (this.feature) {
      if (this.styles && this.styles.length) {
        this.feature.setStyle((feature, resolution) => {
          // todo implement conditions on vl-style-container
          return this.styles
        })
      } else {
        this.feature.setStyle(undefined)
      }
      this.refresh()
    }
  }

  function getStyle () {
    return this.styles || []
  }
</script>

<style>/* stub style  */</style>
