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
  /* global PKG_FULLNAME, PKG_DESCRIPTION */
  import { constant } from 'lodash/fp'
  import common from './common.vue'

  const props = {}

  const computed = {
    currentTitle: constant(PKG_FULLNAME + '.js'),
    currentSubtitle: constant(PKG_DESCRIPTION)
  }

  export default {
    name: 'page-home',
    mixins: [ common ],
    props,
    computed
  }
</script>

<style></style>
