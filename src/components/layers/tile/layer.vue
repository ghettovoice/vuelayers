<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
  import layer from 'vuelayers/src/mixins/layer'

  const props = {
    preload: Number
  }

  export default {
    name: 'vl-tile-layer',
    mixins: [ layer ],
    props
  }
</script>
