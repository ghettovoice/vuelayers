<template>
  <div id="app">
    <VlMap
      :id.sync="mapId"
      ref="map"
      :data-projection.sync="dataProj">
      <VlView
        :id.sync="viewId"
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom"
        :projection.sync="viewProj" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVector :declutter.sync="decl">
        <VlSourceVector :features.sync="features" />
        <VlStyleFunc :function="styleFunc" />
      </VlLayerVector>
    </VlMap>
  </div>
</template>

<script>
  import { createStyle } from '../src/ol-ext'

  export default {
    name: 'App',
    data () {
      return {
        center: [0, 40],
        zoom: 3,
        rotation: 0,
        features: [],
        mapId: 'qwerty',
        viewId: 'asdfg',
        dataProj: 'EPSG:4326',
        viewProj: 'EPSG:3857',
        decl: true,
      }
    },
    mounted () {
      this.features = [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [10, 10],
                [10, 20],
                [20, 20],
                [20, 10],
                [10, 10],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-10, -10],
          },
        },
      ]
    },
    methods: {
      styleFunc () {
        return createStyle({
          fillColor: 'pink',
          strokeColor: 'black',
          strokeWidth: 2,
          imageRadius: 5,
          imageFillColor: 'pink',
          imageStrokeColor: 'black',
          imageStrokeWidth: 2,
        })
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
