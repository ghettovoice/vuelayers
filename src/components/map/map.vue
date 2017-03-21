<template>
  <div class="vl-map">
    <div class="map" :tabindex="tabIndex" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
  import ol from 'openlayers'
  import Observable from 'vl-rx'
  import vmBind from 'vl-mixins/vm-bind'
  import rxSubs from 'vl-mixins/rx-subs'
  import { isFunction } from 'vl-utils/func'

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
      this.$refs.map.focus()
    },
    /**
     * @protected
     */
    subscribeAll () {
      this::subscribeToMapEvents()
    },
    forEachFeatureAtPixel (pixel, cb, layerFilter, hitTolerance) {
      const opts = isFunction(layerFilter) ? { layerFilter, hitTolerance } : layerFilter

      return this.map.forEachFeatureAtPixel(pixel, cb, opts)
    },
    forEachLayerAtPixel (pixel, cb, layerFilter) {
      return this.map.forEachLayerAtPixel(pixel, cb, undefined, layerFilter)
    },
    mountMap () {
      this.map.setTarget(this.$refs.map)
      this.refresh()
      this.subscribeAll()
    },
    unmountMap () {
      this.unsubscribeAll()
      this.map.setTarget(undefined)
    }
  }

  export default {
    name: 'vl-map',
    mixins: [ rxSubs, vmBind ],
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
      this.$nextTick(this.mountMap)
    },
    destroyed () {
      this.$nextTick(() => {
        this.unmountMap()
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

  function subscribeToMapEvents () {
    this.subscribeTo(
      Observable.fromOlEvent(
        this.map,
        [ 'click', 'dblclick', 'singleclick', 'pointerdrag', 'pointermove' ]
      ),
      evt => this.$emit(evt.type, evt)
    )
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../styles/mixins";
  @import "~openlayers/dist/ol";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
