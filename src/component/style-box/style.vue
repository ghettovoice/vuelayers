<script>
  import { Style } from 'ol/style'
  import {
    fillStyleContainer,
    geometryContainer,
    imageStyleContainer,
    strokeStyleContainer,
    textStyleContainer,
    style,
  } from '../../mixin'
  import { constant, isEqual, isFunction } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  /**
   * Style box component.
   * Wrapper for Style class. Can be inserted into component with setStyle/getStyle methods (vl-layer-vector, vl-feature & etc.)
   * and acts as a box for inner style components (vl-style-fill, vl-style-stroke, icon ...)
   */
  export default {
    name: 'VlStyleBox',
    mixins: [
      fillStyleContainer,
      strokeStyleContainer,
      textStyleContainer,
      imageStyleContainer,
      geometryContainer,
      style,
    ],
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.vmId,
          class: this.vmClass,
        }
      },
    },
    props: {
      /**
       * @type {number}
       */
      zIndex: {
        type: Number,
        default: 0,
      },
      /**
       * This condition will be resolved at the style compile time.
       * @type {function|boolean}
       */
      condition: {
        type: [Function, Boolean],
        default: true,
      },
    },
    computed: {
      /**
       * @type {function}
       */
      conditionFunc () {
        return isFunction(this.condition) ? this.condition : constant(this.condition)
      },
    },
    watch: {
      zIndex (value) {
        if (this.$style && !isEqual(value, this.$style.getZIndex())) {
          this.$style.setZIndex(value)
          this.scheduleRefresh()
        }
      },
      ...makeWatchers([
        'condition',
      ], () => style.methods.scheduleRecreate),
    },
    methods: {
      /**
       * @return {module:ol/style/Style~Style}
       * @protected
       */
      createStyle () {
        return new Style({
          zIndex: this.zIndex,
        })
      },
      /**
       * @returns {Promise<module:ol/style/Fill~Fill|undefined>}
       */
      getStyleFill: fillStyleContainer.methods.getFill,
      /**
       * @param {module:ol/style/Fill~Fill|undefined} fill
       * @returns {Promise<void>}
       */
      setStyleFill: fillStyleContainer.methods.setFill,
      /**
       * @returns {Promise<module:ol/style/Stroke~Stroke|undefined>}
       */
      getStyleStroke: strokeStyleContainer.methods.getStroke,
      /**
       * @param {module:ol/style/Stroke~Stroke|undefined} stroke
       * @returns {Promise<void>}
       */
      setStyleStroke: strokeStyleContainer.methods.setStroke,
      /**
       * @returns {Promise<module:ol/style/Text~Text|undefined>}
       */
      getStyleText: textStyleContainer.methods.getText,
      /**
       * @param {module:ol/style/Text~Text|undefined} text
       * @returns {Promise<void>}
       */
      setStyleText: textStyleContainer.methods.setText,
      /**
       * @returns {Promise<module:ol/style/Image~ImageStyle|undefined>}
       */
      getStyleImage: imageStyleContainer.methods.getImage,
      /**
       * @param {module:ol/style/Image~ImageStyle|undefined} image
       * @returns {Promise<void>}
       */
      setStyleImage: imageStyleContainer.methods.setImage,
      /**
       * @return {Promise<module:ol/geom/Geometry~Geometry|undefined>}
       */
      getStyleGeometry: geometryContainer.methods.getGeometry,
      /**
       * @param {GeometryLike|undefined} geom
       * @return {Promise<void>}
       */
      setStyleGeometry: geometryContainer.methods.setGeometry,
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        if (this.$styleContainer) {
          await this.$styleContainer.addStyle(this)
        }
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        if (this.$styleContainer) {
          await this.$styleContainer.removeStyle(this)
        }
      },
      /**
       * @returns {Object}
       * @protected
       */
      getServices () {
        return mergeDescriptors(
          this::fillStyleContainer.methods.getServices(),
          this::strokeStyleContainer.methods.getServices(),
          this::textStyleContainer.methods.getServices(),
          this::imageStyleContainer.methods.getServices(),
          this::geometryContainer.methods.getServices(),
          this::style.methods.getServices(),
        )
      },
    },
  }
</script>
