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

      <VlLayerVectorImage id="features">
        <VlSourceVector :features="features" />
      </VlLayerVectorImage>

      <VlInteractionSelect
        :features.sync="selectedFeatures"
        :condition="pointerMove"
        :layers="['features']">
      </VlInteractionSelect>

      <VlOverlay
        v-show="selectedFeature"
        :position="selectedFeature && selectedFeature.geometry.coordinates">
        <div style="background: #fff">
          {{ selectedFeature && selectedFeature.id }}
        </div>
      </VlOverlay>
    </VlMap>
  </div>
</template>

<script>
  import { random, range } from 'lodash'
  import { pointerMove } from 'ol/events/condition'

  export default {
    name: 'App',
    data () {
      return {
        center: [0, 0],
        zoom: 3,
        rotation: 0,
        features: [],
        selectedFeatures: [],
      }
    },
    computed: {
      selectedFeature () {
        return this.selectedFeatures[0]
      },
    },
    mounted () {
      this.features = range(0, 3000).map(i => ({
        type: 'Feature',
        id: 'feature-' + (i + 1),
        geometry: {
          type: 'Point',
          coordinates: [
            random(-180, 180),
            random(-80, 80),
          ],
        },
      }))
    },
    methods: {
      pointerMove,
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
