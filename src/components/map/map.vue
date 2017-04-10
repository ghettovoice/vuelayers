<template>
  <div class="vl-map">
    <div class="map" :tabindex="tabIndex" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
  import Map from 'ol/map'
  import { constant } from 'lodash/fp'
  import Observable from '../../rx'
  import plainProps from '../../utils/plain-props'
  import { coordinateHelper, geoJson } from '../../ol'
  import rxSubs from '../../mixins/rx-subs'

  const { toLonLat } = coordinateHelper
  const noop = () => {}

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
    forEachFeatureAtPixel (pixel, callback, opts = {}) {
      const cb = (feature, layer) => {
        return callback(
          geoJson.writeFeature(feature),
          layer && plainProps(layer.getProperties())
        )
      }
      const layerFilter = opts.layerFilter || constant(true)
      opts.layerFilter = layer => layerFilter(plainProps(layer.getProperties()))

      return this.map.forEachFeatureAtPixel(pixel, cb, opts)
    },
    forEachLayerAtPixel (pixel, callback, layerFilter = noop) {
      const cb = (layer, rgba) => {
        return callback(
          plainProps(layer.getProperties()),
          rgba
        )
      }
      const lf = layer => layerFilter(plainProps(layer.getProperties()))

      return this.map.forEachLayerAtPixel(pixel, cb, undefined, lf)
    },
    getCoordinateFromPixel (pixel) {
      return toLonLat(this.map.getCoordinateFromPixel(pixel), this.map.getView().getProjection())
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
    // todo disable all default interaction and controls and use custom if defined, wrap all
    // todo render vl-view if not added by external code
    /**
     * @type {Map}
     * @protected
     */
    this.map = new Map({
      layers: [],
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
      [ 'click', 'dblclick', 'singleclick' ],
      ({ type, pixel, coordinate }) => ({ type, pixel, coordinate })
    ).map(evt => ({
      ...evt,
      coordinate: toLonLat(evt.coordinate, this.map.getView().getProjection())
    }))

    this.subscribeTo(pointerEvents, evt => this.$emit(evt.type, evt))
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../styles/mixins";
  @import "~ol/ol";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
