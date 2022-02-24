<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        :center.sync="center"
        :zoom.sync="zoom" />
      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVector
        id="cluster-source"
        class-name="qwerty">
        <VlSourceCluster
          id="cluster-source"
          :distance="50">
          <VlSourceVector
            id="cluster-inner-source"
            :features="features" />
        </VlSourceCluster>
        <VlStyleFunc :function="clusterStyleFunc()" />
      </VlLayerVector>

      <VlInteractionSelect :features.sync="selectedFeatures" />
    </VlMap>
  </div>
</template>

<script>
  import { random, range } from 'lodash'
  import { createStyle } from '../src/ol-ext'

  export default {
    name: 'App',
    data: function () {
      return {
        zoom: 2,
        center: [0, 0],
        extent: null,
        features: range(0, 1000).map(i => {
          return {
            type: 'Feature',
            id: 'random-' + i,
            geometry: {
              type: 'Point',
              coordinates: [
                random(-50, 50),
                random(-50, 50),
              ],
            },
          }
        }),
        selectedFeatures: [],
      }
    },
    methods: {
      clusterStyleFunc () {
        const cache = {}
        return function __clusterStyleFunc (feature) {
          const size = feature.get('features').length
          let style = cache[size]
          if (!style) {
            style = createStyle({
              imageRadius: 10,
              imageStrokeColor: '#ffffff',
              imageFillColor: '#3399cc',
              text: size.toString(),
              textFillColor: '#ffffff',
            })
            cache[size] = style
          }
          return [style]
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
