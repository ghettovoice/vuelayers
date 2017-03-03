<template>
  <i style="display: none !important;">
    <slot :feature="plain"></slot>
  </i>
</template>

<script>
  /**
   * Wrapper around ol.Feature.
   */
  import ol from 'openlayers'
  import uuid from 'node-uuid'
  import { omit } from 'lodash/fp'
  import rxSubs from 'vl-mixins/rx-subs'
  import styleTarget from 'vl-components/style/target'
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

  const methods = {
    refresh () {
      this.feature.changed()
    },
    plain () {
      const obj = {
        id: this.id,
        layer: this.layer() && this.layer().$vm.id,
        data: this.data
      }

      const geom = this.feature.getGeometry()
      if (geom) {
        obj.geometry = {
          type: geom.getType(),
          coordinates: geom.getCoordinates()
        }
      }

      return obj
    },
    styleTarget () {
      return this.feature
    },
    /**
     * @param {ol.style.Style} style
     */
    setStyle (style) {
      // Do not setup style to ol.Feature header, feature level styles will be applied in
      // layer level style function
      this.styles = style
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

  const { provide: styleTargetProvide } = styleTarget

  export default {
    name: 'vl-feature',
    mixins: [ rxSubs, styleTarget ],
    inject: [ 'layer', 'source' ],
    props,
    methods,
    watch,
    provide () {
      return {
        ...this::styleTargetProvide(),
        feature: () => this.feature
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
      this.source() && this.source().removeFeature(this.feature)
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
</script>

<style>/* stub style  */</style>
