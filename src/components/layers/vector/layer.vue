<script>
  import layer from 'vuelayers/src/mixins/layer'
  import { createStyleFunc } from 'vuelayers/src/ol'

  const props = {
    style: Object,
    updateWhileAnimating: {
      type: Boolean,
      default: true
    },
    updateWhileInteracting: {
      type: Boolean,
      default: true
    }
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
