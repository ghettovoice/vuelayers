<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        :center.sync="center"
        :zoom.sync="zoom" />
      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>
      <VlLayerVectorTile>
        <VlSourceVectorTile
          url="https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer/tile/{z}/{y}/{x}.pbf" />
      </VlLayerVectorTile>
    </VlMap>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data: function () {
      return {
        zoom: 5,
        center: [0, 0],
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
