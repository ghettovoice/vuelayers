<template lang="pug">
  div(':class'="[$options.name]")
    vld-hero(':bold'="true" color="is-info")
      h1.title Tile layer
      h2.subtitle Tile layer

    section.section
      vld-cmp-api(':api'="layerApi")
</template>

<script>
  import { constant } from 'lodash/fp'
  import layerApi from '../../api/tile-layer/layer'

  const computed = {
    layerApi: constant(layerApi),
  }

  export default {
    name: 'vld-tile-layer-doc',
    computed,
  }
</script>

<style>
</style>
