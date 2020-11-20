<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        ref="view"
        :center="center"
        :zoom="zoom"
        @update:center="centerChanged"
        @update:zoom="zoomChanged" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>
    </VlMap>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data () {
      let center = [0, 0]
      let zoom = 3
      const urlVals = this.parseUrl()
      if (urlVals) {
        center = urlVals.center
        zoom = urlVals.zoom
      }

      return {
        center,
        zoom,
        rotation: 0,
      }
    },
    methods: {
      centerChanged (center) {
        this.center = center
        this.updateUrl()
      },
      zoomChanged (zoom) {
        this.zoom = zoom
        this.updateUrl()
      },
      updateUrl () {
        const url = new URL(window.location.href)
        url.hash = `#${this.center[0]},${this.center[1]},${this.zoom}`
        window.location.href = url.href
      },
      parseUrl () {
        const url = new URL(window.location.href)
        const hash = url.hash.slice(1)
        if (!hash) return

        const arr = hash.split(',').map(v => Number(v.trim()))
        return {
          center: [arr[0], arr[1]],
          zoom: arr[2],
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
