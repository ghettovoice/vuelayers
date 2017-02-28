<template>
  <div id="app">
    <vl-map>
      <vl-map-view/>
      <vl-geoloc/>

      <vl-layer-tile id="osm">
        <vl-source-osm/>
      </vl-layer-tile>
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
