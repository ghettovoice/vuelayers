<template>
  <div class="vl-map">
    <div class="map" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script rel="text/babel">
  import { isFunction, isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/combineLatest'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/debounceTime'
  import 'rxjs/add/operator/throttleTime'
  import 'vuelayers/src/rx'
  import ol from 'openlayers'
  import { MIN_ZOOM, MAX_ZOOM, MAP_PROJECTION, createStyleFunc } from 'vuelayers/src/ol'
  import { round } from 'vuelayers/src/utils/func'
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
    rotation: {
      type: Number,
      default: 0
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
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#fit}
     */
    fit (geometryOrExtent, options) {
      this.map.getView().fit(geometryOrExtent, options)
    },
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...Object} args
     * @return {Promise}
     */
    animate (...args) {
      let cb = args.find(isFunction)

      return new Promise(
        resolve => this.map.getView()
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
        currentRotation: this.rotation,
        currentProjection: this.projection,
        currentPosition: undefined,
        currentAccuracy: undefined
      }
    },
    created () {
      /**
       * @protected
       */
      this.subs = {}

      this::createMap()
      this::subscribeToViewChanges()
      this.geolocApi && this::subscribeToGeolocation()
    },
    mounted () {
      this.map.setTarget(this.$refs.map)
      this.$nextTick(this.updateMap)
    },
    updated () {
      this.updateMap()
    },
    beforeDestroy () {
      Object.keys(this.subs).forEach(name => {
        this.subs[ name ].unsubscribe()
        delete this.subs[ name ]
      })

      if (this.geoloc) {
        this.geoloc.setTracking(false)
        this.geoloc = this.positionFeature = undefined
      }

      if (this.internalOverlay) {
        this.internalOverlay.setMap(undefined)
        this.internalOverlay = undefined
      }

      if (this.map) {
        this.map.setTarget(undefined)
        this.map = undefined
      }
    }
  }

  /**
   * @return {ol.Map}
   */
  function createMap () {
    // todo wrap all controls and interactions
    this.map = new ol.Map({
      view: this::createView(),
      layers: [],
      // todo disable all default interaction and controls and use custom if defined, wrap all
//      interactions: [],
//      controls: [],
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true
    })

    this.internalOverlay = new ol.layer.Vector({
      map: this.map,
      source: new ol.source.Vector()
    })

    this.map.addInteraction(this::createSelectInteraction())

    if (this.geoloc) {
      /**
       * @protected
       */
      this.geolocApi = new ol.Geolocation({
        tracking: true,
        projection: this.projection
      })
      /**
       * @protected
       */
      this.positionFeature = new ol.Feature({
        internal: true
      })
      this.positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
          src: positionMarker,
          scale: 0.85,
          anchor: [ 0.5, 1 ]
        })
      }))
      this.internalOverlay.getSource().addFeature(this.positionFeature)
    }

    return this.map
  }

  /**
   * @return {ol.View}
   */
  function createView () {
    return new ol.View({
      center: ol.proj.fromLonLat(this.currentCenter, this.currentProjection),
      zoom: this.currentZoom,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      projection: this.currentProjection
    })
  }

  /**
   * @return {ol.interaction.Select}
   */
  function createSelectInteraction () {
    const defStyleFunc = createStyleFunc()
    const internalFeatures = this.internalOverlay.getSource().getFeatures()

    return new ol.interaction.Select({
      filter: feature => !internalFeatures.includes(feature),
      style: feature => {
        const isFeatureLayer = layer => layer === feature.layer
        const layer = this.map.getLayers().getArray().find(isFeatureLayer)

        return layer ? layer.getStyleFunction()(feature) : defStyleFunc(feature)
      }
    })
  }

  /**
   * Subscribe to OpenLayers significant events
   */
  function subscribeToViewChanges () {
    const view = this.map.getView()
    const viewChanges = Observable.fromOlEvent(
      view,
      'change',
      () => {
        const center = ol.proj.toLonLat(view.getCenter(), this.currentProjection)
          .map(x => round(x, 6))
        const zoom = Math.ceil(view.getZoom())
        const rotation = round(view.getRotation(), 6)

        return [ center, zoom, rotation ]
      }
    ).debounceTime(100)
      .distinctUntilChanged((a, b) => isEqual(a, b))

    this.subs.view = viewChanges.subscribe(
      ([ center, zoom, rotation ]) => {
        this.currentZoom = zoom
        this.currentCenter = center
        this.currentRotation = rotation
        this.$emit('viewchanged', [ center, zoom, rotation ])
      },
      ::console.error
    )
  }

  function subscribeToGeolocation () {
    const geolocChanges = Observable.fromOlEvent(
      this.geolocApi,
      'change',
      () => {
        const position = ol.proj.toLonLat(this.geolocApi.getPosition(), this.currentProjection)
          .map(x => round(x, 6))
        const accuracy = round(this.geolocApi.getAccuracy(), 6)

        return [ position, accuracy ]
      }
    ).throttleTime(100)
      .distinctUntilChanged((a, b) => isEqual(a, b))

    this.subs.geoloc = geolocChanges.subscribe(
      ([ position, accuracy ]) => {
        this.currentPosition = position
        this.currentAccuracy = accuracy

        this.$emit('positionchanged', [ position, accuracy ])
      },
      ::console.error
    )
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../styles/mixins";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
