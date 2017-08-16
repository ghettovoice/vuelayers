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
        zIndex: this.zIndex,
        image: this._image,
        stroke: this._stroke,
        fill: this._fill,
        text: this._text,
        geometry: this._geometry
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$parent && this.$parent.addStyle(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$parent && this.$parent.removeStyle(this)
    },
    /**
     * @param {ol.style.Image|Vue|undefined} image
     * @return {void}
     */
    setImage (image) {
      image = image instanceof Vue ? image.$style : image

      if (image !== this._image) {
        this._image = image
      }
      if (this.$style && image !== this.$style.getImage()) {
        this.$style.setImage(image)
        this.requestRefresh()
      }
    },
    /**
     * @param {ol.geom.Geometry|Vue|undefined} geom
     * @return {void}
     */
    setGeometry (geom) {
      geom = geom instanceof Vue ? geom.$geometry : geom

      if (geom !== this._geometry) {
        this._geometry = geom
      }
      if (this.$style && geom !== this.$style.getGeometry()) {
        this.$style.setGeometry(geom)
        this.requestRefresh()
      }
    },
    /**
     * @param {ol.style.Text|undefined} text
     * @return {void}
     */
    setText (text) {
      text = text instanceof Vue ? text.$style : text

      if (text !== this._text) {
        this._text = text
      }
      if (this.$style && text !== this.$style.getText()) {
        this.$style.setText(text)
        this.requestRefresh()
      }
    }
  }

  const watch = {
    zIndex (value) {
      if (!this.$style) return

      this.$style.setZIndex(value)
      this.requestRefresh()
    }
  }

  export default {
    name: 'vl-style-box',
    mixins: [style, withFillStroke],
    props,
    methods,
    watch,
    created () {
      /**
       * @type {ol.style.Image|undefined}
       * @private
       */
      this._image = undefined
      /**
       * @type {ol.style.Text|undefined}
       * @private
       */
      this._text = undefined
      /**
       * @type {ol.geom.Geometry|undefined}
       * @private
       */
      this._geometry = undefined
    },
    destroyed () {
      this._image = this._text = this._geometry = undefined
    }
  }
</script>
