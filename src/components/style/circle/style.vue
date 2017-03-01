<script>
  import ol from 'openlayers'
  import { flow, map, filter } from 'lodash/fp'
  import style from 'vuelayers/src/mixins/style'

  const extractStyle = flow(
    filter(n => !!n.componentInstance),
    map(n => n.componentInstance.style)
  )

  const props = {
    radius: {
      type: Number,
      default: 5
    },
    snapToPixel: {
      type: Boolean,
      default: true
    }
  }

  const methods = {
    /**
     * @return {ol.style.Circle}
     * @protected
     */
    createStyle () {
      const styles = extractStyle(this.$slots && this.$slots.default || [])
      const fill = styles.find(s => (s instanceof ol.style.Fill))
      const stroke = styles.find(s => (s instanceof ol.style.Stroke))

      return new ol.style.Circle({
        radius: this.radius,
        snapToPixel: this.snapToPixel,
        fill,
        stroke
      })
    },
    /**
     * @protected
     */
    append () {
      this.styleTarget && this.styleTarget.setImage(this.style)
    },
    /**
     * @protected
     */
    remove () {
      this.styleTarget && this.styleTarget.setImage(undefined)
    },
    expose () {
      // emulate setFill/setStroke methods because children of ol.style.Image do not have fill/stroke setters
      // emulated setter simply recreates instance of ol.style.Circle with fill/stroke taken from default slot
      const style = {
        setFill: this::reCreate,
        setStroke: this::reCreate
      }

      return {
        ...this.$parent.expose(),
        styleTarget: style,
        style
      }
    }
  }

  export default {
    name: 'vl-style-circle',
    mixins: [ style ],
    props,
    methods,
    render (h) {
      return h('i', {
        style: {
          display: 'none'
        }
      }, this.$slots.default)
    }
  }

  function reCreate () {
    this.remove()
    this.style = this.createStyle()
    this.style.vm = this
    this.append()
  }
</script>

<style>/* stub styles */</style>
