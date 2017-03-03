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
  import { warn } from 'vl-utils/debug'

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
        layer: this.layer() && this.layer().$vm.id
      }
    }
  }

  const methods = {
    refresh () {
      this.feature.changed()
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
    mixins: [ rxSubs ],
    inject: [ 'layer', 'source' ],
    props,
    methods,
    watch,
    computed,
    provide () {
      return {
        feature: () => this.feature,
        setStyle: this::setStyle,
        getStyle: this::getStyle
      }
    },
    created () {
      this::createFeature()
    },
    mounted () {
      if (this.source()) {
        this.source().addFeature(this.feature)
      } else if (process.env.NODE_ENV !== 'production') {
        warn("Invalid usage of feature component, should have source component among it's ancestors")
      }
    },
    destroyed () {
      console.log(this.source())
      if (this.source()) {
        this.source().removeFeature(this.feature)
      } else {
        // todo
      }
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
    this.feature.$vm = this

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
