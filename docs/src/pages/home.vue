<template>
  <div class="page home">
    map to background, content on front of map
    VueLayers.js - Components ...
    Based on VueJs and OpenLayers
    <vl-map :def-controls="false">
      <vl-view :zoom="2"/>

      <vl-layer-tile>
        <vl-source-sputnik/>
      </vl-layer-tile>
    </vl-map>
  </div>
</template>

<script>
  const computed = {
  }

  export default {
    name: 'page-home',
    computed
  }
</script>

<style></style>
