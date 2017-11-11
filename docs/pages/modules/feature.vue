<template lang="pug">
  div(':class'="[$options.name]")
    vld-hero(':bold'="true" color="is-info")
      h1.title Feature
      h2.subtitle A vector object for geographic features

    section.section
      hr

      vld-markdown.
        ### vl-feature

        A vector object for geographic features with a geometry and other attribute properties,
        similar to the features in vector file formats like **GeoJSON**.

        Features can be placed inside components that are mixes in `featuresContainer` mixin such as: `vl-map`, `vl-source-vector` and etc.

        Features can be styled individually with `vl-style-*` placed inside default slot; otherwise they use the
        style of their vector layer.
      vld-cmp-api(':api'="featureApi")
</template>

<script>
  import { constant } from 'lodash/fp'
  import featureApi from '../../api/feature/feature'
  /* eslint-disable import/no-webpack-loader-syntax */
  /* eslint-enable import/no-webpack-loader-syntax */

  const computed = {
    featureApi: constant(featureApi),
  }

  export default {
    name: 'vld-map-doc',
    computed,
  }
</script>

<style>
</style>
