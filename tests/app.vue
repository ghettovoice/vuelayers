<template>
  <div id="app">
    <VlMap
      ref="map"
      :default-interactions="interactionOptions"
      data-projection="EPSG:4326">
      <VlView
        :zoom.sync="zoom"
        :center.sync="center"
        :extent="[-10,-10,10,10]" />
      <VlLayerTile>
        <VlSourceOsm @created="sourceCreated" />
      </VlLayerTile>

      <VlLayerVector>
        <VlSourceVector :features="savedFeatures" />
      </VlLayerVector>

      <VlInteractionSelect :features.sync="selectedFeatures" />
    </VlMap>
  </div>
</template>

<script>
  import { random, range } from 'lodash'
  // import { OverviewMap } from 'ol/control'
  // import { Tile as TileLayer } from 'ol/layer'

  export default {
    name: 'App',
    data: function () {
      return {
        zoom: 5,
        center: [0, 0],
        extent: null,
        features: [],
        selectedFeatures: [],
        savedFeatures: range(0, 100).map(i => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              random(-50, 50),
              random(-50, 50),
            ],
          },
        })),
        url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
        interactionOptions: {
          dragPan: true,
          onFocusOnly: true,
          shiftDragZoom: true,
          mouseWheelZoom: true,
          pinchZoom: true,
        },
        mapLock: false,
      }
    },
    watch: {
      mapLock () {
        this.lockToggle()
      },
    },
    methods: {
      sourceCreated (vm) {
        // this.$refs.map.addControl(new OverviewMap({
        //   collapsed: false,
        //   layers: [new TileLayer({ source: vm.$source })],
        // }))
      },
      lockToggle () {
        this.interactionOptions.dragPan = !this.interactionOptions.dragPan
        this.interactionOptions.onFocusOnly = !this.interactionOptions.onFocusOnly
        this.interactionOptions.shiftDragZoom = !this.interactionOptions.shiftDragZoom
        this.interactionOptions.mouseWheelZoom = !this.interactionOptions.mouseWheelZoom
        this.interactionOptions.pinchZoom = !this.interactionOptions.pinchZoom
      },
    },
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "~ol/ol";

  html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    box-sizing: border-box;
    font-family: Helvetica, Arial, sans-serif;
    overflow: hidden;

    * {
      box-sizing: border-box;
    }
  }
</style>
