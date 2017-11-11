<template lang="pug">
  div(':class'="[$options.name]")
    vld-hero(':bold'="true" color="is-info")
      h1.title Map
      h2.subtitle Start point of every VueLayers based application

    section.section
      vld-markdown.
        Map module consists of two components:
        - `vl-map` - viewport rendering, interaction and map events
        - `vl-view` - 2D view of the map

        Module has several entry files for different module systems, correct entry file will be resolved automatically
        according to local `package.json` file.
      vld-code(title="Install" lang="js").
        import Vue from 'vue'
        // import module and styles
        import { Map } from 'vuelayers'
        // or
        import Map from 'vuelayers/lib/map'
        // import VueLayers styles
        import 'vuelayers/lib/style.css'
        // register vl-map and vl-view components
        Vue.use(Map)
      vld-markdown.
        The example below shows how to create a simple map with tile layer and
        [OSM](https://www.openstreetmap.org/#map=3/69.63/-74.88) source.
      vld-example(title="Usage")
        b-tab-item(label="HTML")
          vld-code(lang="html") {{ usage.template | pre }}
        b-tab-item(label="JS")
          vld-code(lang="js") {{ usage.script | pre }}
        b-tab-item(label="Result")
          usage-example

      hr

      vld-markdown.
        ### vl-map

        `vl-map` component is a container for **layers**, **interactions**, **controls**, **overlays** and **features**.
        It has only one slot `default` to place all child components.
      vld-cmp-api(':api'="mapApi")

      hr

      vld-markdown.
        ### vl-view

        Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
        **resolution**, and **rotation** of the map.

        `vl-view` is a wrapper for **OpenLayers** `ol.View` class, so it can share underlying `ol.View` instance
        between multiple maps to fully synchronize them (like [here](https://openlayers.org/en/latest/examples/side-by-side.html)).
      vld-example(title="Shared view")
        b-tab-item(label="HTML")
          vld-code(lang="html") {{ shared.template | pre }}
        b-tab-item(label="JS")
          vld-code(lang="js") {{ shared.script | pre }}
        b-tab-item(label="Result")
          shared-example
      vld-cmp-api(':api'="viewApi")
</template>

<script>
  import { constant } from 'lodash/fp'
  import { extractScript, extractTemplate, extractStyle } from '../../utils'
  import mapApi from '../../api/map/map'
  import viewApi from '../../api/map/view'
  /* eslint-disable import/no-webpack-loader-syntax */
  import UsageExample from '../../examples/map/usage.vue'
  import usageExampleSrc from '!raw-loader!../../examples/map/usage.vue'
  import SharedExample from '../../examples/map/shared.vue'
  import sharedExampleSrc from '!raw-loader!../../examples/map/shared.vue'
  /* eslint-enable import/no-webpack-loader-syntax */

  const computed = {
    mapApi: constant(mapApi),
    viewApi: constant(viewApi),
    usage () {
      return {
        script: extractScript(usageExampleSrc),
        template: extractTemplate(usageExampleSrc),
        style: extractStyle(usageExampleSrc),
      }
    },
    shared () {
      return {
        script: extractScript(sharedExampleSrc),
        template: extractTemplate(sharedExampleSrc),
        style: extractStyle(sharedExampleSrc),
      }
    },
  }

  export default {
    name: 'vld-map-doc',
    components: {
      UsageExample,
      SharedExample,
    },
    computed,
  }
</script>

<style>
</style>
