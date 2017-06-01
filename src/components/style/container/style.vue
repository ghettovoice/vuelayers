<script>
  /**
   * Style container component.
   * Wrapper for ol.style.Style class. Can be inserted into style target component (layer, feature & etc.)
   * and acts as style target for inner style components (fill, stroke, icon ...)
   */
  import Style from 'ol/style/style'
  import { warndbg } from '../../../utils/debug'
  import style from '../style'
  import { assertHasStyle, assertHasStyleTarget } from '../../../utils/assert'
  import { SERVICE_CONTAINER_KEY } from '../../../consts'

  const props = {
    zIndex: Number,
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
      assertHasStyleTarget(this)

      let currentStyle = this.styleTarget.getStyle() || []
      if (currentStyle && !Array.isArray(currentStyle)) {
        if (typeof currentStyle === 'function') {
          warndbg('Avoid combining vl-style-func and vl-style-container components on the same level ' +
            'because it can lead to the wrong result')
        }
        currentStyle = []
      }

      currentStyle.push({
        style: this.style,
        condition: this.condition
      })
      this.styleTarget.setStyle(currentStyle)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      assertHasStyleTarget(this)

      let currentStyle = this.styleTarget.getStyle() || []
      if (currentStyle && !Array.isArray(currentStyle)) {
        if (typeof currentStyle === 'function') {
          warndbg('Style target already has defined style that is not an array. ' +
            'Avoid combining vl-style-func and vl-style-container components on the same level ' +
            'because it can lead to the wrong result')
        }
        currentStyle = []
      }

      currentStyle = currentStyle.filter(x => x.style !== this.style)
      currentStyle.length || (currentStyle = undefined)
      this.styleTarget.setStyle(currentStyle)
    },
    /**
     * @param {ol.style.Fill} fill
     * @return {void}
     * @protected
     */
    setFill (fill) {
      assertHasStyle(this)
      this.style.setFill(fill)
      this.deferRefresh()
    },
    /**
     * @param {ol.geom.Geometry|ol.StyleGeometryFunction} geom
     * @return {void}
     * @protected
     */
    setGeometry (geom) {
      assertHasStyle(this)
      this.style.setGeometry(geom)
      this.deferRefresh()
    },
    /**
     * @param {ol.style.Image} image
     * @return {void}
     * @protected
     */
    setImage (image) {
      assertHasStyle(this)
      this.style.setImage(image)
      this.deferRefresh()
    },
    /**
     * @param {ol.style.Stroke} stroke
     * @return {void}
     * @protected
     */
    setStroke (stroke) {
      assertHasStyle(this)
      this.style.setStroke(stroke)
      this.deferRefresh()
    },
    /**
     * @param {ol.style.Text} text
     * @return {void}
     * @protected
     */
    setText (text) {
      assertHasStyle(this)
      this.style.setText(text)
      this.deferRefresh()
    }
  }

  const watch = {
    zIndex (value) {
      assertHasStyle(this)
      this.style.setZIndex(value)
      this.deferRefresh()
    }
  }

  export default {
    name: 'vl-style-container',
    mixins: [style],
    props,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.$options.name
        }
      }
    },
    inject: {
      serviceContainer: SERVICE_CONTAINER_KEY
    },
    provide () {
      return {
        [SERVICE_CONTAINER_KEY]: {
          // style container provides style target as an object with setters for it's own props
          styleTarget:  {
            setFill: this.setFill,
            setGeometry: this.setGeometry,
            setImage: this.setImage,
            setStroke: this.setStroke,
            setText: this.setText
          }
        }
      }
    }
  }
</script>
