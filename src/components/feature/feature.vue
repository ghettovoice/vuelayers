<template>
  <i style="display: none !important;">
    <slot :feature="plain"></slot>
  </i>
</template>

<script>
  /**
   * Wrapper around ol.Feature.
   *
   * @todo Add property 'visible', like in layer. If visible = false -> set null style
   */
  import ol from 'openlayers'
  import uuid from 'uuid/v4'
  import styleTarget from 'vl-components/style/target'
  import { warn } from 'vl-utils/debug'

  const props = {
    id: {
      type: [ String, Number ],
      default: () => uuid()
    },
    data: {
      type: Object,
      default: () => ({})
    }
  }

  const methods = {
    refresh () {
      this.feature && this.feature.changed()
    },
    plain () {
      const obj = {
        id: this.id,
        layer: this.layer() && this.layer().$vm.id,
        data: this.data
      }

      const geom = this.feature && this.feature.getGeometry()
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
    }
  }

  const watch = {
    id (value) {
      if (this.feature) {
        this.feature.setId(value)
        this.feature.set('id', value)
      }
    },
    data (value) {
      this.feature && this.feature.set('data', value)
    }
  }

  const { provide: styleTargetProvide } = styleTarget

  export default {
    name: 'vl-feature',
    mixins: [ styleTarget ],
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
      this.$nextTick(() => {
        if (this.source()) {
          this.source().addFeature(this.feature)
        } else if (process.env.NODE_ENV !== 'production') {
          warn("Invalid usage of feature component, should have source component among it's ancestors")
        }
      })
    },
    destroyed () {
      this.$nextTick(() => {
        this.source() && this.source().removeFeature(this.feature)
        this.feature = undefined
      })
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
    this.feature = new ol.Feature({
      id: this.id,
      data: this.data,
      layer: this.layer() && this.layer().$vm.id
    })
    this.feature.setId(this.id)
    this.feature.$vm = this

    return this.feature
  }
</script>

<style>/* stub style  */</style>
