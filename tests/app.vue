<template>
  <div id="app">
    <VlMap
      ref="map"
      :default-interactions="interactions"
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
          ident="target"
          :features.sync="features" />
        <VlStyle>
          <VlStyleStroke
            color="blue"
            :width="5" />
        </VlStyle>
      </VlLayerVector>
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
        features: [],
        interactions: {
          dragPan: false,
        },
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
