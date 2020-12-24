<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVector>
        <VlSourceVector
          url="https://gist.githubusercontent.com/ghettovoice/37ef37dd571ed39b0985c16560b157d3/raw/a850973f91b811e4ef9af5c317c0dead661ff2ac/map.geojson"
          :features.sync="features"
          @addfeature="onAddFeature"
          @removefeature="onRemoveFeature" />
      </VlLayerVector>

      <VlInteractionSelect
        :features.sync="selectedFeatures"
        @select="onSelect"
        @unselect="onUnselect" />
    </VlMap>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data () {
      return {
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [10, 10],
            },
          },
        ],
        selectedFeatures: [],
      }
    },
    methods: {
      onSelect (evt) {
        console.log('select', evt)
      },
      onUnselect (evt) {
        console.log('unselect', evt)
      },
      onAddFeature (evt) {
        console.log('add', evt)
      },
      onRemoveFeature (evt) {
        console.log('remove', evt)
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
