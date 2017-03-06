<template>
  <div class="vl-map">
    <div class="map" :tabindex="tabIndex" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script rel="text/babel">
  import ol from 'openlayers'

  const props = {
    loadTilesWhileAnimating: {
      type: Boolean,
      default: false
    },
    loadTilesWhileInteracting: {
      type: Boolean,
      default: false
    },
    pixelRatio: {
      type: Number,
      default: 1
    },
    renderer: [ String, Array ],
    logo: [ String, Object ],
    keyboardEventTarget: [ String, Node ],
    tabIndex: {
      type: Number,
      default: 0
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
    }
  }

  export default {
    name: 'vl-map',
    props,
    methods,
    provide () {
      return {
        map: () => this.map,
        serviceLayer: () => this.serviceLayer,
        view: () => this.map.getView()
      }
    },
    created () {
      this::createMap()
    },
    mounted () {
      this.$nextTick(() => {
        this.map.setTarget(this.$refs.map)
        this.refresh()
      })
    },
    destroyed () {
      this.$nextTick(() => {
        this.serviceLayer.setMap(undefined)
        this.map.setTarget(undefined)
        this.map = this.serviceLayer = undefined
      })
    }
  }

  /**
   * @return {ol.Map}
   */
  function createMap () {
    /**
     * @type {ol.Map}
     * @protected
     */
    this.map = new ol.Map({
      layers: [],
      // todo disable all default interaction and controls and use custom if defined, wrap all
//      interactions: [],
//      controls: [],
      loadTilesWhileAnimating: this.loadTilesWhileAnimating,
      loadTilesWhileInteracting: this.loadTilesWhileInteracting,
      pixelRatio: this.pixelRatio,
      renderer: this.renderer,
      logo: this.logo,
      keyboardEventTarget: this.keyboardEventTarget
    })

    this.map.$vm = this

    this.serviceLayer = new ol.layer.Vector({
      map: this.map,
      source: new ol.source.Vector()
    })

    return this.map
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../styles/mixins";
  @import "~openlayers/dist/ol";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
