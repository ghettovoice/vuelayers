<template lang="pug">
  div(':class'="[$options.name]")
    vld-hero(':bold'="true" color="is-info")
      h1.title Feature
      h2.subtitle Components for geographic features

    section.section
      vld-markdown.
        Module provides components to work with vector geographic features. Currently it consists of:
        - `vl-feature` - component to render one vector object

        Module has several entry files for different module systems, correct entry file will be resolved automatically
        according to local `package.json` file.
      vld-code(title="Install" lang="js").
        import Vue from 'vue'
        // import module and styles
        import { Feature } from 'vuelayers'
        // or
        import Feature from 'vuelayers/lib/feature'
        // import VueLayers styles
        import 'vuelayers/lib/style.css'
        // register vl-feature components
        Vue.use(Feature)

      hr

      vld-markdown.
        ### vl-feature

        A vector object for geographic features with a geometry and other attribute properties,
        similar to the features in vector file formats like **GeoJSON**. It acts like geometry container for
        `vl-geom-*` components, without geometry component nothing will be rendered.

        Features can be placed inside components that are mixes in `featuresContainer` mixin,
        such as: `vl-map`, `vl-source-vector` and etc.

        Features can be styled individually with `vl-style-*` placed inside **default** slot; otherwise they use the
        style of their vector layer.
      vld-example(title="Simple usage as standalone marker")
        b-tab-item(label="HTML")
          vld-code(lang="html") {{ simple.template | pre }}
        b-tab-item(label="JS")
          vld-code(lang="js") {{ simple.script | pre }}
        b-tab-item(label="Result")
          simple-example
      vld-example(title="Render as static feature inside vector layer")
        b-tab-item(label="HTML")
          vld-code(lang="html") {{ layer.template | pre }}
        b-tab-item(label="JS")
          vld-code(lang="js") {{ layer.script | pre }}
        b-tab-item(label="Result")
          layer-example
      vld-cmp-api(':api'="featureApi")
</template>

<script>
  import { constant } from 'lodash/fp'
  import featureApi from '../../api/feature/feature'
  import { extractScript, extractTemplate, extractStyle } from '../../utils'
  /* eslint-disable import/no-webpack-loader-syntax */
  import SimpleExample from '../../examples/feature/simple.vue'
  import simpleExampleSrc from '!raw-loader!../../examples/feature/simple.vue'
  import LayerExample from '../../examples/feature/layer.vue'
  import layerExampleSrc from '!raw-loader!../../examples/feature/layer.vue'
  /* eslint-enable import/no-webpack-loader-syntax */

  const computed = {
    featureApi: constant(featureApi),
    simple () {
      return {
        script: extractScript(simpleExampleSrc),
        template: extractTemplate(simpleExampleSrc),
        style: extractStyle(simpleExampleSrc),
      }
    },
    layer () {
      return {
        script: extractScript(layerExampleSrc),
        template: extractTemplate(layerExampleSrc),
        style: extractStyle(layerExampleSrc),
      }
    },
  }

  export default {
    name: 'vld-map-doc',
    components: {
      SimpleExample,
      LayerExample,
    },
    computed,
  }
</script>

<style>
</style>
