<template>
  <div id="app">
    <VlMap
      ref="map"
      :data-projection="dataProj">
      <VlView
        ref="view"
        :center.sync="center"
        :rotation.sync="rotation"
        :zoom.sync="zoom" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlFeature>
        <VlGeomPoint :coordinates.sync="point" />
      </VlFeature>

      <VlLayerVector>
        <VlSourceVector
          :features.sync="features"
          url="https://gist.githubusercontent.com/ghettovoice/37ef37dd571ed39b0985c16560b157d3/raw/3499326b779d6c2c2e28ec49c9e492be3bbf8f0f/map.geojson" />
      </VlLayerVector>

      <VlInteractionSelect
        ident="modify-target"
        :features.sync="selectedFeatures" />
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
        features: [],
        selectedFeatures: [],
        dataProj: 'EPSG:4326',
        point: [10, 10],
      }
    },
    methods: {
      start (evt) {
        console.log('start', evt)
      },
      end (evt) {
        console.log('end', evt)
      },
      progress (evt) {
        console.log('progress', evt)
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
