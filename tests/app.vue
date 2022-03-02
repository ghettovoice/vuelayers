<template>
  <div id="app">
    <p>
      Drawn features: {{ drawnFeatures }}
    </p>
    <button @click="undo">
      Undo
    </button>
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        :center.sync="center"
        :zoom.sync="zoom" />
      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVector>
        <VlSourceVector
          :features.sync="features"
          ident="draw" />
      </VlLayerVector>

      <VlInteractionDraw
        ref="draw"
        source="draw"
        type="polygon"
        @drawend="drawend"
        @drawstart="drawstart" />
    </VlMap>
  </div>
</template>

<script>

  export default {
    name: 'App',
    data: function () {
      return {
        zoom: 2,
        center: [0, 0],
        extent: null,
        features: [],
        drawing: false,
      }
    },
    computed: {
      drawnFeatures () {
        return this.features.map(({ id }) => id)
      },
    },
    methods: {
      undo () {
        if (this.drawing) {
          this.$refs.draw.removeLastPoint()
        } else {
          this.features.pop()
        }
      },
      drawstart () {
        this.drawing = true
      },
      drawend ({ feature }) {
        this.drawing = false
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
