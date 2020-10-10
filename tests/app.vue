<template>
  <div id="app">
    <VlMap
      ref="map"
      :data-projection="dataProj">
      <VlView
        ref="view"
        :center.sync="center"
        :zoom.sync="zoom"
        :projection="viewProj" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

<!--      <VlLayerVector>-->
<!--        <VlSourceVector-->
<!--          ident="draw"-->
<!--          :features="features"-->
<!--          :projection="featProj" />-->
<!--      </VlLayerVector>-->
    </VlMap>
  </div>
</template>

<script>
  import { register } from 'ol/proj/proj4'
  import proj4 from 'proj4'

  proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs')
  register(proj4)

  export default {
    name: 'App',
    data () {
      return {
        center: [598703.7995171356, 6225813.035968694],
        // center: [8.4, 56.4],
        zoom: 6,
        rotation: 0,
        features: [],
        dataProj: 'EPSG:25832',
        viewProj: 'EPSG:25832',
        featProj: 'EPSG:4326',
        selectedFeatures: [],
      }
    },
    mounted () {
      this.features = [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [8.41552734375, 56.41390137600676],
                [8.173828125, 55.4040698270061],
                [10.04150390625, 55.02802211299252],
                [10.87646484375, 55.85064987433714],
                [9.33837890625, 55.801280971180454],
                [9.64599609375, 56.401744392758964],
                [11.2939453125, 56.389583525613055],
                [11.44775390625, 55.7765730186677],
                [12.041015625, 56.401744392758964],
                [11.557617187499998, 56.728621973140726],
                [9.16259765625, 56.80087831233043],
                [8.41552734375, 56.41390137600676],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [9.9371337890625, 56.258608725706935],
                [9.931640625, 55.979945357882315],
                [10.4864501953125, 55.979945357882315],
                [10.546875, 56.14860953861174],
                [10.37109375, 56.28605924471002],
                [10.2777099609375, 56.07816700469287],
                [10.107421874999998, 56.105746831832036],
                [9.9371337890625, 56.258608725706935],
              ],
            ],
          },
        },
      ]
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
