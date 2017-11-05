<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
    <vl-view :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return {
        center: [0, 0],
        zoom: 3,
        rotation: 0,
      }
    },
  }
</script>
