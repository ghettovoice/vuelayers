<script>
  import Fill from 'ol/style/fill'
  import style from '../style'
  import { assertHasStyle } from '../../../utils/assert'

  const props = {
    color: [String, Array]
  }

  const methods = {
    /**
     * @return {ol.style.Fill}
     * @protected
     */
    createStyle () {
      return new Fill({
        color: this.color
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent.setFill(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent.setFill(undefined)
    }
  }

  const watch = {
    color (value) {
      assertHasStyle(this)
      this.style.setColor(value)
      this.deferRefresh()
    }
  }

  export default {
    name: 'vl-style-fill',
    mixins: [style],
    props,
    methods,
    watch
  }
</script>
