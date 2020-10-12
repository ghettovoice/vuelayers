<template>
  <div id="app">
    <VlMap
      ref="map"
      :data-projection="dataProj">
      <VlView
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom"
        :projection="viewProj" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVector>
        <VlSourceCluster>
          <VlSourceVector :features="features" />
        </VlSourceCluster>
      </VlLayerVector>
    </VlMap>
  </div>
</template>

<script>
  import { register } from 'ol/proj/proj4'
  import proj4 from 'proj4'

  proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs')
  register(proj4)

  export default {
    name: 'App',
    data () {
      return {
        center: [0, 0],
        zoom: 3,
        rotation: 0,
        features: [],
        dataProj: 'EPSG:4326',
        viewProj: 'EPSG:3857',
      }
    },
    mounted () {
      this.features = [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [10, 10],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [14, 14],
          },
        },
      ]
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
