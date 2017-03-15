<template>
  <div class="vl-map">
    <div class="map" :tabindex="tabIndex" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
  import ol from 'openlayers'
  import vmBind from 'vl-mixins/vm-bind'

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
      if (this.map) {
        this.map.updateSize()
        this.map.render()
      }
    },
    /**
     * Trigger focus on map container.
     */
    focus () {
      this.$refs.map.focus()
    }
  }

  export default {
    name: 'vl-map',
    mixins: [ vmBind ],
    props,
    methods,
    provide () {
      return Object.defineProperties(Object.create(null), {
        map: {
          enumerable: true,
          get: () => this.map
        },
        view: {
          enumerable: true,
          get: () => this.map.getView()
        }
      })
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
        this.map.setTarget(undefined)
        this.map = undefined
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

    this.bindSelfTo(this.map)

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
