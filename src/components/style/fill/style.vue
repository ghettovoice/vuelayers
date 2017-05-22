<script>
  import Fill from 'ol/style/fill'
  import style from '../style'
  import { assertHasStyleTarget } from '../../../utils/assert'

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
      assertHasStyleTarget(this)
      this.styleTarget.setFill(this.style)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      assertHasStyleTarget(this)
      this.styleTarget.setFill(undefined)
    }
  }

  const watch = {
    color (value) {
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
