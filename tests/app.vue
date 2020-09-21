<template>
  <div id="app">
    <button @click="url = urls[0]">
      OSM
    </button>
    <button @click="url = urls[1]">
      Sputnik
    </button>
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom" />

      <VlLayerTile>
        <VlSourceXyz :url="url" />
      </VlLayerTile>
    </VlMap>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data () {
      return {
        zoom: 3,
        center: [0, 0],
        rotation: 0,
        urls: [
          'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'http://tiles.maps.sputnik.ru/{z}/{x}/{y}.png',
        ],
        url: null,
      }
    },
    created () {
      this.url = this.urls[0]
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
