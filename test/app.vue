<template>
  <div id="app">
    <vl-map>
      <vl-view :center="[ 50.69435, 55.452967 ]" :zoom="8" />
      <vl-geoloc/>

      <vl-tile-layer id="osm">
        <vl-osm-source/>
      </vl-tile-layer>
      <vl-tile-layer id="satellite">
        <vl-xyz-source
          :url="'http://geoportal.glonass-112.net/tilecache/satellite/{0z}/{x1}/{x2}/{x3}/{-y1}/{-y2}/{-y3}.png'"
          :attributions="'Картографические данные © ГЛОНАСС+112, ' + (new Date().getFullYear())"/>
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
