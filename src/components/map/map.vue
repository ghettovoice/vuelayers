<template>
  <div class="vl-map">
    <div class="map" :tabindex="tabIndex" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
  import Map from 'ol/map'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/map'
  import 'vl-rx/from-ol-event'
  import rxSubs from 'vl-mixins/rx-subs'
  import { isEqual } from 'lodash/fp'
  import { toLonLat } from 'vl-ol/coordinate'

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
    // todo work with GeoJSON
    forEachFeatureAtPixel (pixel, cb, layerFilter, hitTolerance) {
      const opts = typeof layerFilter === 'function' ? { layerFilter, hitTolerance } : layerFilter

      return this.map.forEachFeatureAtPixel(pixel, cb, opts)
    },
    // todo work with GeoJSON
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
    mixins: [ rxSubs ],
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
   * @return {Map}
   */
  function createMap () {
    /**
     * @type {Map}
     * @protected
     */
    this.map = new Map({
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
    this.map.set('vm', this)

    return this.map
  }

  function subscribeToMapEvents () {
    const pointerEvents = Observable.fromOlEvent(
      this.map,
      [ 'click', 'dblclick', 'singleclick', 'pointerdrag', 'pointermove' ],
      ({ type, pixel, coordinate }) => ({ type, pixel, coordinate })
    ).distinctUntilChanged((a, b) => isEqual(a, b))
      .map(evt => ({
        ...evt,
        coordinate: toLonLat(evt.coordinate, this.view.getProjection())
      }))

    this.subscribeTo(pointerEvents, evt => this.$emit(evt.type, evt))
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../styles/mixins";
  @import "~ol/ol.css";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
