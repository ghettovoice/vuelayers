<template>
  <div id="app">
    <vl-map>
      <vl-view/>
      <vl-geoloc/>

      <vl-tile-layer id="osm">
        <vl-osm-source/>
      </vl-tile-layer>
    </vl-map>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style lang="scss">
  @import "~openlayers/dist/ol";

  html, body, #app {
    width  : 100%;
    height : 100%;
    margin : 0;
  }
</style>
