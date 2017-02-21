<template>
  <div class="vl-map">
    <div class="map" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script rel="text/babel">
  import ol from 'openlayers'
  import olBase from '../../core/mixins/ol/base'
  import { MIN_ZOOM, MAX_ZOOM, MAP_PROJECTION, createStyleFunc } from '../../core/ol'
  import positionMarker from '../../assets/position-marker.svg'
//  import searchMarker from '../../assets/search-marker.svg'

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
    }
  }

  export default {
    name: 'vl-map',
    mixins: [ olBase ],
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
      this::createMap()
    },
    mounted () {
      this.$nextTick(() => {
        this._map.setTarget(this.$refs.map)
        this.updateMap()
      })
    },
    updated () {
      this.updateMap()
    },
    beforeDestroy () {
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
    const map = this._map = new ol.Map({
      view: this::createView(),
      layers: [],
      interactions: ol.interaction.defaults().extend([
        this::createSelectInteraction()
      ]),
      // disable all default controls and use custom if defined
      controls: [],
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true
    })

    this._internalOverlay = new ol.layer.Vector({
      map: map,
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

    return map
  }

  /**
   * @return {ol.View}
   */
  function createView () {
    return new ol.View({
      center: this.center,
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
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../core/scss/mixins";

  .vl-map {
    @include vl-wh(100%, 100%);
  }
</style>
