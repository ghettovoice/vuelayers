<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        :zoom.sync="zoom"
        :center.sync="center" />
      <VlLayerTile>
        <VlSourceOsm @created="sourceCreated" />
      </VlLayerTile>
    </VlMap>
  </div>
</template>

<script>
  import { random, range } from 'lodash'
  import { OverviewMap } from 'ol/control'
  import { Tile as TileLayer } from 'ol/layer'

  export default {
    name: 'App',
    data: function () {
      return {
        zoom: 1,
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
      }
    },
    methods: {
      sourceCreated (vm) {
        this.$refs.map.addControl(new OverviewMap({
          collapsed: false,
          layers: [new TileLayer({ source: vm.$source })],
        }))
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
