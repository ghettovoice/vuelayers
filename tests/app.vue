<template>
  <div id="app">
    <VlMap
      ref="map">
      <VlView
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVectorImage id="features">
        <VlSourceVector
          url="https://openlayers.org/en/latest/examples/data/gpx/fells_loop.gpx"
          :features.sync="features"
          :format-factory="gpxFactory" />
        <VlStyleFunc :function="styleFunc" />
      </VlLayerVectorImage>
    </VlMap>
  </div>
</template>

<script>
  import { GPX } from 'ol/format'
  import { Circle, Fill, Stroke, Style } from 'ol/style'

  export default {
    name: 'App',
    data () {
      return {
        zoom: 12,
        center: [-7916041.528716288, 5228379.045749711],
        rotation: 0,
        features: [],
        selectedFeatures: [],
      }
    },
    computed: {
      styleFunc () {
        return this.newStyleFunc()
      },
    },
    methods: {
      gpxFactory () {
        return new GPX()
      },
      newStyleFunc () {
        const style = {
          Point: new Style({
            image: new Circle({
              fill: new Fill({
                color: 'rgba(255,255,0,0.4)',
              }),
              radius: 5,
              stroke: new Stroke({
                color: '#ffff00',
                width: 1,
              }),
            }),
          }),
          LineString: new Style({
            stroke: new Stroke({
              color: '#ff0000',
              width: 3,
            }),
          }),
          MultiLineString: new Style({
            stroke: new Stroke({
              color: '#0f0',
              width: 3,
            }),
          }),
        }

        return feature => style[feature.getGeometry().getType()]
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
