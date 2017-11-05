<template>
  <div class="columns is-gapless" style="height: 400px">
    <vl-map class="column" :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
      <vl-view ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"></vl-view>

      <vl-layer-tile>
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>
    </vl-map>

    <vl-map class="column" :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
      <vl-view ident="view"></vl-view>

      <vl-layer-tile>
        <vl-source-sputnik></vl-source-sputnik>
      </vl-layer-tile>
    </vl-map>
  </div>
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
