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

      <VlLayerVector>
        <VlSourceVector
          :features.sync="features"
          url="https://gist.githubusercontent.com/ghettovoice/37ef37dd571ed39b0985c16560b157d3/raw/3499326b779d6c2c2e28ec49c9e492be3bbf8f0f/map.geojson" />
      </VlLayerVector>

      <VlInteractionSelect
        ident="modify-target"
        :features.sync="selectedFeatures">
        <template slot-scope="selection">
          <VlOverlay
            v-for="feature in selection.features"
            :id="feature.id + '-overlay'"
            :key="feature.id"
            :position="findPointOnSurface(feature.geometry)">
            <div
              slot-scope="overlay"
              style="background: #fff; padding: 10px 20px;">
              <p>Position: {{ overlay.position }}</p>
              <p>Feature {{ feature.id }}</p>
            </div>
          </VlOverlay>
        </template>
      </VlInteractionSelect>
    </VlMap>
  </div>
</template>

<script>
  import { findPointOnSurface } from '../src/ol-ext'

  export default {
    name: 'App',
    data () {
      return {
        zoom: 3,
        center: [0, 0],
        rotation: 0,
        features: [],
        selectedFeatures: [],
      }
    },
    methods: {
      findPointOnSurface,
      modifyStart (evt) {
        console.log('start', evt)
      },
      modifyEnd (evt) {
        console.log('end', evt)
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
