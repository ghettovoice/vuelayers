<script>
  import Vue from 'vue'
  import Style from 'ol/style/Style'
  import style from '../../mixin/style'
  import withFillStrokeStyle from '../../mixin/with-fill-stroke-style'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { isEqual } from '../../util/minilo'

  /**
   * Style box component.
   * Wrapper for Style class. Can be inserted into component with setStyle/getStyle methods (vl-layer-vector, vl-feature & etc.)
   * and acts as a box for inner style components (vl-style-fill, vl-style-stroke, icon ...)
   */

  const props = {
    zIndex: {
      type: Number,
      default: 0,
    },
    condition: {
      type: [Function, Boolean],
      default: true,
    },
  }

  const methods = {
    /**
     * @return {Style}
     * @protected
     */
    createStyle () {
      return new Style({
        zIndex: this.zIndex,
        image: this._image,
        stroke: this._stroke,
        fill: this._fill,
        text: this._text,
        geometry: this._geometry,
      })
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(this::style.methods.getServices(), {
        get stylesContainer () { return vm },
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$stylesContainer && this.$stylesContainer.addStyle(this)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.$stylesContainer && this.$stylesContainer.removeStyle(this)
    },
    /**
     * @param {Image|Vue|undefined} image
     * @return {void}
     */
    setImage (image) {
      image = image instanceof Vue ? image.$style : image

      if (image !== this._image) {
        this._image = image
      }
      if (this.$style && image !== this.$style.getImage()) {
        this.$style.setImage(image)
        this.scheduleRefresh()
      }
    },
    /**
     * @param {Geometry|Vue|undefined} geom
     * @return {void}
     */
    setGeometry (geom) {
      geom = geom instanceof Vue ? geom.$geometry : geom

      if (geom !== this._geometry) {
        this._geometry = geom
      }
      if (this.$style && geom !== this.$style.getGeometry()) {
        this.$style.setGeometry(geom)
        this.scheduleRefresh()
      }
    },
    /**
     * @param {Text|undefined} text
     * @return {void}
     */
    setText (text) {
      text = text instanceof Vue ? text.$style : text

      if (text !== this._text) {
        this._text = text
      }
      if (this.$style && text !== this.$style.getText()) {
        this.$style.setText(text)
        this.scheduleRefresh()
      }
    },
  }

  const watch = {
    zIndex (value) {
      if (this.$style && !isEqual(value, this.$style.getZIndex())) {
        this.$style.setZIndex(value)
        this.scheduleRefresh()
      }
    },
  }

  export default {
    name: 'vl-style-box',
    mixins: [style, withFillStrokeStyle],
    props,
    methods,
    watch,
    created () {
      /**
       * @type {Image|undefined}
       * @private
       */
      this._image = undefined
      /**
       * @type {Text|undefined}
       * @private
       */
      this._text = undefined
      /**
       * @type {Geometry|undefined}
       * @private
       */
      this._geometry = undefined
    },
  }
</script>
