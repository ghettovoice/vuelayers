<template>
  <div id="app">
    <VlMap
      ref="map">
      <VlView
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom"
        :projection="viewProj" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVector>
        <VlSourceVector
          ref="vectorSource"
          :features.sync="features" />
      </VlLayerVector>
    </VlMap>
  </div>
</template>

<script>
  import { Feature } from 'ol'
  import { Circle } from 'ol/geom'

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
      setTimeout(() => {
        this.$refs.vectorSource.addFeatures([
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
              coordinates: [20, 20],
            },
          },
          new Feature(new Circle([-20e5, -20e5], 20e5)),
        ])
      }, 1000)
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
