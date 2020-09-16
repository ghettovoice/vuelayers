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

      <vl-layer-vector
        ref="layer"
        :z-index="1">
        <vl-source-vector ref="source">
          <vl-feature>
            <vl-geom-point :coordinates="[10, 10]" />
            <vl-style-box>
              <vl-style-icon
                :src="markerUrl"
                :scale="0.1"
                :rotation="0"
                :anchor="[0.5, 1]" />
            </vl-style-box>
          </vl-feature>

          <vl-feature ref="feature">
            <vl-geom-point :coordinates="[-10, -10]" />
            <vl-style-box>
              <vl-style-icon
                :src="markerUrl"
                :scale="0.1"
                :anchor="[0.5, 1]"
                :rotation="rotation"
                :rotate-with-view="true" />
            </vl-style-box>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
    </VlMap>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data () {
      return {
        zoom: 3,
        center: [0, 0],
        rotation: 0,
        features: [],
        markerUrl: 'https://cdn0.iconfinder.com/data/icons/navigation-set-arrows-part-two/32/Arrow_Up_Circle-256.png',
      }
    },
    created () {
      setInterval(() => {
        this.rotation = Math.random() * (1.5 - 1) + 1
      }, 3000)
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
