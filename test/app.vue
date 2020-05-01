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
          ref="vectorSource"
          :features.sync="features"
          :format-factory="formatFactory"
          :loading-strategy="loadingStrategy"
          :loader="loader" />

        <VlStyleBox>
          <VlStyleCircle>
            <VlStyleFill color="white" />
            <VlStyleStroke color="red" />
          </VlStyleCircle>
          <VlStyleFill color="white" />
          <VlStyleStroke color="green" />
          <VlStyleText text="qwerty" />
        </VlStyleBox>
      </VlLayerVector>
    </VlMap>
  </div>
</template>

<script>
  import OSMXML from 'ol/format/OSMXML'
  import { bbox as bboxStrategy } from 'ol/loadingstrategy'

  export default {
    name: 'App',
    data () {
      return {
        zoom: 18,
        center: [6.6405083, 46.7791258],
        rotation: 0,
        features: [],
      }
    },
    methods: {
      formatFactory () {
        return new OSMXML()
      },
      loadingStrategy: bboxStrategy,
      loader (extent) {
        return new Promise(resolve => {
          const client = new XMLHttpRequest()
          client.open('POST', 'https://overpass-api.de/api/interpreter')
          client.addEventListener('load', () => {
            resolve(client.responseText)
          })
          const query = '(node(' +
            extent[1] + ',' + Math.max(extent[0], -180) + ',' +
            extent[3] + ',' + Math.min(extent[2], 180) +
            ');rel(bn)->.foo;way(bn);node(w)->.foo;rel(bw););out meta;'
          client.send(query)
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
