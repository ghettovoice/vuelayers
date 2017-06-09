<script>
  /**
   * Style box component.
   * Wrapper for ol.style.Style class. Can be inserted into component with setStyle/getStyle methods (vl-layer-vector, vl-feature & etc.)
   * and acts as a box for inner style components (vl-style-fill, vl-style-stroke, icon ...)
   */
  import Vue from 'vue'
  import Style from 'ol/style/style'
  import style from '../style'
  import withFillStroke from '../with-fill-stroke'
  import { assertHasStyle } from '../../../utils/assert'

  const props = {
    zIndex: {
      type: Number,
      default: 0
    },
    condition: {
      type: [Function, Boolean],
      default: true
    }
  }

  const methods = {
    /**
     * @return {ol.style.Style}
     * @protected
     */
    createStyle () {
      return new Style({
        zIndex: this.zIndex
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent.addStyle(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent.removeStyle(this)
    },
    /**
     * @param {ol.style.Image|Vue|undefined} image
     * @return {void}
     */
    setImage (image) {
      assertHasStyle(this)

      image = image instanceof Vue ? image.style : image
      this.style.setImage(image)
      this.requestRefresh()
    },
    /**
     * @param {ol.geom.Geometry|Vue|undefined} geom
     * @return {void}
     */
    setGeometry (geom) {
      assertHasStyle(this)

      geom = geom instanceof Vue ? geom.geom : geom
      this.style.setGeometry(geom)
      this.requestRefresh()
    },
    /**
     * @param {ol.style.Text|undefined} text
     * @return {void}
     */
    setText (text) {
      assertHasStyle(this)

      text = text instanceof Vue ? text.style : text
      this.style.setText(text)
      this.requestRefresh()
    }
  }

  const watch = {
    zIndex (value) {
      assertHasStyle(this)
      this.style.setZIndex(value)
      this.requestRefresh()
    }
  }

  export default {
    name: 'vl-style-box',
    mixins: [style, withFillStroke],
    props,
    methods,
    watch
  }
</script>
