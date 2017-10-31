<template lang="pug">
  div(':class'="[$options.name]")
    vld-markdown.
      Map module includes two components:
      - `vl-map` - viewport rendering, interaction and map events
      - `vl-view` - 2D view of the map

      Module has several entry files for different module systems, correct entry file will be resolved automatically
      according to local `package.json` file.
    vld-code(title="Install").
      import Vue from 'vue'
      // import module and styles
      import { Map } from 'vuelayers'
      // or
      import Map from 'vuelayers/lib/map'
      // import VueLayers styles
      import 'vuelayers/lib/style.css'
      // register vl-map and vl-view components
      Vue.use(Map)
    vld-code(title="Usage" lang="html").
      &lt;vl-map :load-tiles-while-animating=&quot;true&quot; :load-tiles-while-interacting=&quot;true&quot;&gt;
        &lt;vl-view :center=&quot;[0, 0]&quot; :zoom=&quot;3&quot; :rotation=&quot;0&quot;&gt;&lt;/vl-view&gt;

        &lt;vl-layer-tile&gt;
          &lt;vl-source-osm&gt;&lt;/vl-source-osm&gt;
        &lt;/vl-layer-tile&gt;
      &lt;/vl-map&gt;
</template>

<script>
  /* eslint-disable import/no-webpack-loader-syntax */
  /* eslint-enable import/no-webpack-loader-syntax */

  const computed = {
  }

  export default {
    name: 'vld-module-map-doc',
    computed,
  }
</script>

<style>
</style>
