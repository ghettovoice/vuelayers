<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        ref="view"
        :center.sync="center"
        :rotation.sync="rotation"
        :zoom.sync="zoom" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerGraticule :show-labels="true">
        <VlStyleStroke
          slot="stroke"
          color="rgba(255,120,0,0.9)"
          :width="2"
          :line-dash="[0.5, 4]" />
      </VlLayerGraticule>

      <VlFeature>
        <VlGeomPoint :coordinates="[0, 0]" />
        <VlStyle>
          <VlStyleCircle />
          <VlStyleText text="qwerty">
            <VlStyleFill
              slot="background"
              color="cyan" />
          </VlStyleText>
        </VlStyle>
      </VlFeature>
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
