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
      vld-code(
        v-for="(example, i) in examples"
        ':key'="i"
        ':title'="example.caption"
        ':lang'="example.lang"
      ) {{ example.code | pre }}
      vld-markdown.
        The example below shows how to create a simple map with tile layer and
        [OSM](https://www.openstreetmap.org/#map=3/69.63/-74.88) source.
      vld-example(
        v-for="(example, i) in vueExamples"
        ':key'="i"
        ':title'="example.caption"
      )
        b-tab-item(':label'="example.lang.toUpperCase()")
          vld-code(':lang'="example.lang") {{ example.code | pre }}
        b-tab-item(label="Result" v-html="example.code" compile)

      hr

      vld-markdown.
        ### vl-map

        Container for **layers**, **interactions**, **controls** and **overlays**. It has one default slot for
        `vl-view`, `vl-layer-*`, `vl-interaction-*`, `vl-overlay` and `vl-feature` components placement.
      vld-cmp-api(':doclets'="mapDoclets")

      hr

      vld-markdown.
        ### vl-view

        Container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
        rendering and low level interaction events.
      vld-cmp-api(':doclets'="viewDoclets")
</template>

<script>
  import { constant } from 'lodash/fp'
  import { findMainDoclet, mapExamples } from '../../jsdoc-helper'
  /* eslint-disable import/no-webpack-loader-syntax */
  import moduleDoclets from '!jsdoc-loader!../../../src/components/map/index.js'
  import mapDoclets from '!jsdoc-loader!../../../src/components/map/map.vue'
  import viewDoclets from '!jsdoc-loader!../../../src/components/map/view.vue'
  /* eslint-enable import/no-webpack-loader-syntax */

  const computed = {
    moduleDoclets: constant(moduleDoclets),
    mainModuleDoclet () {
      return findMainDoclet(this.moduleDoclets)
    },
    examples () {
      let examples = (this.mainModuleDoclet && this.mainModuleDoclet.examples) || []
      return mapExamples(examples)
    },
    vueExamples () {
      let examples = (this.mainModuleDoclet && this.mainModuleDoclet.vueExamples) || []
      return mapExamples(examples)
    },
    mapDoclets: constant(mapDoclets),
    viewDoclets: constant(viewDoclets),
  }

  export default {
    name: 'vld-map-doc',
    computed,
  }
</script>

<style>
</style>
