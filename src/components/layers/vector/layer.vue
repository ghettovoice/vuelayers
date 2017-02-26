<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
  import layer from 'vuelayers/src/mixins/layer'
  import { createStyleFunc } from 'vuelayers/src/ol'

  const props = {
    style: Object,
    updateWhileAnimating: Boolean,
    updateWhileInteracting: Boolean
  }

  const computed = {
    styleFunc () {
      return createStyleFunc(this.style)
    }
  }

  export default {
    name: 'vl-vector-layer',
    mixins: [ layer ],
    props,
    computed
  }
</script>
