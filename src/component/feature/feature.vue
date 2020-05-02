<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot
      :id="id"
      :properties="properties">
      <PointGeom :coordinates="[0, 0]" />
    </slot>
  </i>
</template>

<script>
  import { feature } from '../../mixin'
  import PointGeom from './point-geom.vue'

  /**
   * A vector object for geographic features with a geometry and other attribute properties,
   * similar to the features in vector file formats like **GeoJSON**.
   */
  export default {
    name: 'VlFeature',
    components: {
      PointGeom,
    },
    mixins: [
      feature,
    ],
  }
</script>
