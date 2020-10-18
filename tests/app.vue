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

      <VlLayerVectorImage
        id="vector"
        :z-index="2">
        <VlSourceVector
          ref="vectorSource"
          :features.sync="features" />
      </VlLayerVectorImage>

      <VlInteractionSelect
        :hit-tolerance="8"
        :condition="hoverCond"
        :layers="['vector']">
        <template slot-scope="selection">
          <VlOverlay
            v-for="feature in selection.features"
            :id="feature.id"
            :key="feature.id"
            :position="findPoint(feature.geometry)"
            :auto-pan="true"
            :auto-pan-animation="{ duration: 300 }"
            :style="{ maxWidth: '300px', maxHeight: '200px', overflow: 'auto', backgroundColor: 'whitesmoke', padding: '10px' }">
            <p>
              {{ feature.id }}<br>
              Qwerty 123
            </p>
          </VlOverlay>
        </template>
      </VlInteractionSelect>
    </VlMap>
  </div>
</template>

<script>
  import { Feature } from 'ol'
  import { Circle } from 'ol/geom'
  import { pointerMove } from 'ol/events/condition'
  import { findPointOnSurface } from '@/ol-ext'

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
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [-20, 20],
                [-15, 25],
                [-10, 30],
              ],
            },
          },
          new Feature(new Circle([-20e5, -20e5], 20e5)),
        ])
      }, 1000)
    },
    methods: {
      hoverCond: pointerMove,
      findPoint: findPointOnSurface,
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
