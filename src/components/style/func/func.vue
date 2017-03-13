<script>
  /**
   * Style function component for advanced styling.
   * Plays the role of both a style that mounts itself to style target (layer, feature & etc.)
   * and style target for inner style containers.
   */
  import ol, { style as styleHelper } from 'vl-ol'
  import style from 'vl-components/style/style'
  import styleTarget, { createStyleFunc } from 'vl-components/style/target'
  import { warn } from 'vl-utils/debug'
  import { isEmpty } from 'vl-utils/func'

  const props = {
    factory: {
      type: Function,
      default: () => {}
    }
  }

  const methods = {
    /**
     * @return {ol.style.Style}
     * @protected
     */
    createStyle () {
      // user provided style function
      const providedStyleFunc = this.factory(ol, styleHelper)
      // fallback style function made from inner style containers
      const fallbackStyleFunc = createStyleFunc(this)

      return function __styleFunc (feature, resolution) {
        const plainFeature = feature.plain()
        let styles = providedStyleFunc(plainFeature, resolution, feature.layer && feature.layer.id)

        if (!isEmpty(styles)) return styles

        return fallbackStyleFunc(feature, resolution)
      }
    },
    mountStyle () {
      if (!isEmpty(this.parentGetStyle())) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Style target already have defined styles, will be replaced with style function')
        }
      }

      this.parentSetStyle(this.style)
    },
    unmountStyle () {
      this.parentSetStyle(undefined)
    },
    setStyle (style) {
      // simply save all inner styles and
      // use them later in style function as fallback
      this.styles = style
    }
  }

  const watch = {
    factory () {
      // todo implement
    }
  }

  export default {
    name: 'vl-style-func',
    mixins: [ style, styleTarget ],
    inject: {
      parentSetStyle: 'setStyle',
      parentGetStyle: 'getStyle'
    },
    props,
    methods,
    watch
  }
</script>

<style>/* stub styles */</style>
