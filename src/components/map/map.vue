<template>
  <div class="vl-map">
    <div class="map" ref="map"></div>
    <slot name="view"></slot>
    <slot name="layers"></slot>
    <slot></slot>
  </div>
</template>

<script rel="text/babel">
  import ol from 'openlayers'
  import exposeInject from 'vuelayers/src/mixins/expose-inject'
  import { style as olStyle } from 'vuelayers/src/ol'
  // todo move all to mixin
  const props = {
    loadTilesWhileAnimating: {
      type: Boolean,
      default: false
    },
    loadTilesWhileInteracting: {
      type: Boolean,
      default: false
    }
  }

  const methods = {
    /**
     * Updates `ol.Map` view
     */
    refresh () {
      this.map.updateSize()
      this.map.render()
    },
    /**
     * Trigger focus on map container.
     */
    focus () {
      this.$el.tabIndex = 0
      this.$el.focus()
    },
    expose () {
      return {
        map: this.map,
        view: this.map.getView(),
        serviceOverlay: this.serviceOverlay
      }
    }
  }

  export default {
    name: 'vl-map',
    mixins: [ exposeInject ],
    props,
    methods,
    created () {
      /**
       * @type {ol.Map}
       * @protected
       */
      this.map = this::createMap()
      this.map.vm = this

      this.serviceOverlay = new ol.layer.Vector({
        map: this.map,
        source: new ol.source.Vector()
      })

      this.map.addInteraction(this::createSelectInteraction())
    },
    mounted () {
      this.map.setTarget(this.$refs.map)
      this.$nextTick(() => {
        this.refresh()
      })
    },
    beforeDestroy () {
      this.serviceOverlay.setMap(undefined)
      this.map.setTarget(undefined)
    },
    destroyed () {
      this.map = this.serviceOverlay = undefined
    }
  }

  /**
   * @return {ol.Map}
   */
  function createMap () {
    // todo wrap all controls and interactions
    return new ol.Map({
      layers: [],
      // todo disable all default interaction and controls and use custom if defined, wrap all
//      interactions: [],
//      controls: [],
      loadTilesWhileAnimating: this.loadTilesWhileAnimating,
      loadTilesWhileInteracting: this.loadTilesWhileInteracting
    })
  }

  /**
   * @return {ol.interaction.Select}
   */
  function createSelectInteraction () {
    const defStyleFunc = olStyle.createStyleFunc()
    const internalFeatures = this.serviceOverlay.getSource().getFeatures()

    return new ol.interaction.Select({
      filter: feature => !internalFeatures.includes(feature),
      style: feature => {
        const isFeatureLayer = layer => layer === feature.layer
        const layer = this.map.getLayers().getArray().find(isFeatureLayer)

        return layer ? layer.getStyleFunction()(feature) : defStyleFunc(feature)
      }
    })
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../styles/mixins";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
