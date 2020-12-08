<template>
  <div id="app">
    <vl-map ref="map" data-projection="EPSG:4326">
      <vl-view :center.sync="center" :rotation.sync="rotation" :zoom.sync="zoom"
               ident="view" ref="view" />

      <vl-layer-tile id="osm">
        <vl-source-osm />
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-source-vector ident="target" :features.sync="features" />
      </vl-layer-vector>
      <vl-interaction-draw source="target" type="polygon" @drawend="drawEnd" />
      <vl-interaction-modify source="target" @modifyend="modifyEnd" />
    </vl-map>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data () {
      return {
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        features: [],
      }
    },
    methods: {
      drawEnd ({ feature }) {
        console.log('new feature', feature)
        console.log('drawn features', this.features.slice())
      },
      modifyEnd (evt) {
        console.log('modified', evt)
        console.log('features', this.features[0].geometry.coordinates.slice(0))
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

  .panel {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 70vw;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 20px rgba(2, 2, 2, 0.1);
    padding: 5px;
    text-align: center;
    z-index: 1;

    > button {
      margin: 5px;
      padding: 5px 10px;
      text-transform: uppercase;
    }
  }
</style>
