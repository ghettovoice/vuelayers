<template>
  <div class="vl-map">
    <div class="map" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script rel="text/babel">
  import { isFunction } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'vuelayers/src/rx'
  import 'rxjs/add/observable/combineLatest'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/debounceTime'
  import ol from 'openlayers'
  import { MIN_ZOOM, MAX_ZOOM, MAP_PROJECTION, createStyleFunc } from 'vuelayers/src/ol'
  import { roundTo } from 'vuelayers/src/utils/func'
  import positionMarker from './position-marker.svg'

  const props = {
    zoom: {
      type: Number,
      default: MIN_ZOOM
    },
    center: {
      type: Array,
      default: () => ([ 0, 0 ]),
      validator: value => value.length === 2
    },
    maxZoom: {
      type: Number,
      default: MAX_ZOOM
    },
    minZoom: {
      type: Number,
      default: MIN_ZOOM
    },
    projection: {
      type: String,
      default: MAP_PROJECTION
    },
    geoloc: Boolean
  }

  const methods = {
    /**
     * Updates `ol.Map` view
     */
    updateMap () {
      this._map.updateSize()
      this._map.render()
    },
    /**
     * Trigger focus on map container.
     */
    focus () {
      this.$el.tabIndex = 0
      this.$el.focus()
    },
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#fit}
     */
    fit (geometryOrExtent, options) {
      this._map.getView().fit(geometryOrExtent, options)
    },
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...Object} args
     * @return {Promise}
     */
    animate (...args) {
      let cb = args.find(isFunction)

      return new Promise(
        resolve => this._map.getView()
          .animate(...args, complete => {
            cb && cb(complete)
            resolve(complete)
          })
      )
    }
  }

  export default {
    name: 'vl-map',
    props,
    methods,
    data () {
      return {
        currentZoom: this.zoom,
        currentCenter: this.center,
        currentProjection: this.projection
      }
    },
    created () {
      this._subs = {}

      this::createMap()
      this::subscribeToOlChanges()
    },
    mounted () {
      this._map.setTarget(this.$refs.map)
      this.$nextTick(this.updateMap)
    },
    updated () {
      this.updateMap()
    },
    beforeDestroy () {
      Object.keys(this._subs).forEach(name => {
        this._subs[name].unsubscribe()
        delete this._subs[name]
      })

      if (this._geoloc) {
        this._geoloc.setTracking(false)
        this._geoloc = this._positionFeature = undefined
      }

      if (this._internalOverlay) {
        this._internalOverlay.setMap(null)
        this._internalOverlay = undefined
      }

      if (this._map) {
        this._map.setTarget(null)
        this._map = undefined
      }
    }
  }

  /**
   * @return {ol.Map}
   */
  function createMap () {
    // todo wrap all controls and interactions
    this._map = new ol.Map({
      view: this::createView(),
      layers: [],
      interactions: ol.interaction.defaults().extend([
        this::createSelectInteraction()
      ]),
      // disable all default controls and use custom if defined
//      controls: [],
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true
    })

    this._internalOverlay = new ol.layer.Vector({
      map: this._map,
      source: new ol.source.Vector()
    })

    if (this.geoloc) {
      this._geoloc = new ol.Geolocation({
        tracking: true,
        projection: this.projection
      })

      this._positionFeature = new ol.Feature({
        internal: true
      })
      this._positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
          src: positionMarker,
          scale: 0.85,
          anchor: [ 0.5, 1 ]
        })
      }))
      this._internalOverlay.getSource().addFeature(this._positionFeature)
    }

    return this._map
  }

  /**
   * @return {ol.View}
   */
  function createView () {
    return new ol.View({
      center: ol.proj.fromLonLat(this.center, this.projection),
      zoom: this.zoom,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      projection: this.projection
    })
  }

  /**
   * @return {ol.interaction.Select}
   */
  function createSelectInteraction () {
    const defStyleFunc = createStyleFunc()
    const internalFeatures = [
      this._positionFeature
    ]

    return new ol.interaction.Select({
      filter: feature => !internalFeatures.includes(feature),
      style: feature => {
        const isFeatureLayer = layer => layer === feature.layer
        const layer = this._map.getLayers().getArray().find(isFeatureLayer)

        return layer ? layer.getStyleFunction()(feature) : defStyleFunc(feature)
      }
    })
  }

  /**
   * Subscribe to OpenLayers significant events
   */
  function subscribeToOlChanges () {
    const view = this._map.getView()
    const zoomChanges = Observable.fromOlEvent(view, 'change:resolution')
    const centerChanges = Observable.fromOlEvent(view, 'change:center')
    const viewChanges = Observable.combineLatest(zoomChanges, centerChanges, (z, c) => {
      return [
        Math.ceil(z),
        c.map(x => roundTo(x, 6))
      ]
    }).debounceTime(100)
      .distinctUntilChanged()

    this._subs.view = viewChanges.subscribe(
      ([ zoom, center ]) => {
        this.currentZoom = zoom
        this.currentCenter = center
      },
      ::console.error
    )
  }
</script>

<style lang="scss" rel="stylesheet/styles">
  @import "../../styles/mixins";

  .vl-map {
    @include vl-wh(100%, 100%);
  }
</style>
