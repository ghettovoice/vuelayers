<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
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
        :features.sync="selectedFeatures"
        :hit-tolerance="8"
        :condition="hoverCond"
        :layers="['vector']">
        <template slot-scope="selection">
          <VlStyleFunc :func="styleFunc" />
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
  import { findPointOnSurface } from '@/ol-ext'
  import { pointerMove } from 'ol/events/condition'
  import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'

  export default {
    name: 'App',
    data () {
      return {
        center: [0, 0],
        zoom: 3,
        rotation: 0,
        features: [],
        selectedFeatures: [],
        dataProj: 'EPSG:4326',
        viewProj: 'EPSG:3857',
      }
    },
    computed: {
      styleFunc () {
        const stroke = new Stroke({
          color: 'red',
          width: 3,
          lineCap: 'square',
          lineJoin: 'miter',
        })
        const fill = new Fill({
          color: 'white',
        })
        return () => {
          return new Style({
            stroke,
            fill,
            image: new CircleStyle({
              stroke,
              fill,
              radius: 10,
            }),
          })
        }
      },
    },
    mounted () {
      this.features = [
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
      ]
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
