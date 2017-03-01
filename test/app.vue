<template>
  <div id="app">
    <vl-map>
      <vl-map-view/>
      <vl-geoloc/>

      <vl-layer-tile id="osm">
        <vl-source-osm/>
      </vl-layer-tile>

      <vl-layer-vector id="vector">
        <vl-style-container slot="style">
          <vl-style-stroke color="#13A838" :width="4"/>
          <vl-style-fill color="#62E5E3"/>
        </vl-style-container>

        <vl-source-vector>
          <vl-feature id="1">
            <vl-geom-polygon :coordinates="[ [ [10, 10], [10, 70], [70, 10], [10, 10] ] ]"/>
          </vl-feature>

          <vl-feature id="2">
            <vl-style-container slot="style">
              <vl-style-circle :radius="10">
                <vl-style-stroke color="#13A838" :width="4"/>
                <vl-style-fill color="#62E5E3"/>
              </vl-style-circle>
            </vl-style-container>

            <vl-geom-multi-point :coordinates="[ [-50, -50], [-45, -45] ]"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
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
