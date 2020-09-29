<template>
  <div id="app">
    <VlMap
      ref="map">
      <VlView
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVector>
        <VlSourceVector
          :features="features"
          projection="EPSG:4326" />
      </VlLayerVector>

      <VlLayerTile>
        <VlSourceTileWms
          url="https://wms.geo.admin.ch/"
          projection="EPSG:21781"
          layers="ch.swisstopo.pixelkarte-farbe-pk1000.noscale"
          cross-origin="anonymous" />
      </VlLayerTile>
    </VlMap>
  </div>
</template>

<script>
  import proj4 from 'proj4'
  import { register } from 'ol/proj/proj4'

  proj4.defs(
    'EPSG:21781',
    '+proj=somerc +lat_0=46.95240555555556 ' +
      '+lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel ' +
      '+towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs',
  )
  register(proj4)

  export default {
    name: 'App',
    data () {
      return {
        zoom: 3,
        center: [0, 0],
        rotation: 0,
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [20, 20],
            },
          },
        ],
      }
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
