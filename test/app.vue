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
        <VlSourceVector :features="features" />
        <VlStyleFunc :factory="styleFuncFactory">
          <VlStyle>
            <VlStyleCircle />
            <VlStyleText
              text="qwerty"
              :offset-x="20"
              :rotation="0.4">
              <VlStyleFill color="black" />
              <VlStyleFill
                slot="background"
                color="cyan" />
            </VlStyleText>
          </VlStyle>
        </VlStyleFunc>
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
        zoom: 3,
        center: [0, 0],
        rotation: 0,
        features: [
          {
            type: 'Feature',
            properties: {
              active: true,
            },
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
          {
            type: 'Feature',
            properties: {
              active: false,
            },
            geometry: {
              type: 'Point',
              coordinates: [10, 10],
            },
          },
          {
            type: 'Feature',
            properties: {
              none: true,
            },
            geometry: {
              type: 'Point',
              coordinates: [0, 10],
            },
          },
        ],
      }
    },
    methods: {
      styleFuncFactory () {
        const defaultStyle = createStyle({
          imageFillColor: 'white',
          imageStrokeColor: 'blue',
          imageStrokeWidth: 2,
          imageRadius: 5,
        })
        const activeStyle = createStyle({
          imageFillColor: 'white',
          imageStrokeColor: 'green',
          imageStrokeWidth: 2,
          imageRadius: 8,
        })

        return feature => {
          if (feature.get('none')) return

          return feature.get('active') ? activeStyle : defaultStyle
        }
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
