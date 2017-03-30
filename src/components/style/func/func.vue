<script>
  /**
   * Style function component for advanced styling.
   * Plays the role of both a style that mounts itself to style target (layer, feature & etc.)
   * and style target for inner style containers.
   */
  import * as geoJson from 'vl-ol/geojson'
  import * as styleHelper from 'vl-ol/style'
  import { warn } from 'vl-utils/debug'
  import style from 'vl-components/style/style'
  import styleTarget, { createStyleFunc } from 'vl-components/style/target'

  const props = {
    factory: {
      type: Function,
      required: true
    }
  }

  const methods = {
    /**
     * @return {ol.style.Style}
     * @protected
     */
    createStyle () {
      // fallback style function made from inner style containers
      const fallbackStyleFunc = createStyleFunc(this)
      // user provided style function
      let providedStyleFunc = this.factory(styleHelper)
      let type = typeof providedStyleFunc
      if (type !== 'function') {
        if (process.env.NODE_ENV !== 'production') {
          warn(`Style function factory returned value is of type ${type}, expected type is Function`)
        }
        providedStyleFunc = () => {}
      }

      const view = this.view

      return function __styleFunc (feature, resolution) {
        const styles = providedStyleFunc(
          geoJson.writeFeature(feature, view.getProjection()),
          resolution,
          styleHelper
        )

        if (styles === null || !styles.length) return styles

        return fallbackStyleFunc(feature, resolution)
      }
    },
    mountStyle () {
      let currentStyle = this.stGetStyle()
      if (currentStyle && process.env.NODE_ENV !== 'production') {
        warn('Style target already has defined style. Avoid use of multiple vl-style-func or ' +
             'combining vl-style-func and vl-style-container components on the same level')
      }
      this.stSetStyle(this.style)
    },
    unmountStyle () {
      this.stSetStyle(undefined)
    },
    setFallbackStyle (style) {
      // simply save all inner styles and
      // use them later in style function as fallback
      this.styles = style
    },
    getFallbackStyle () {
      return this.styles
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
      ...style.inject.reduce((all, value) => ({
        ...all,
        [ value ]: value
      }), {}),
      stSetStyle: 'setStyle',
      stGetStyle: 'getStyle'
    },
    provide: false, // reset provide from style target mixin
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.$options.name
        }
      }
    },
    props,
    methods,
    watch,
    created () {
      // custom provide of setStyle / getStyle methods to mirror style target between
      // real style target (layer, feature) and style container
      // defined here because Vue starts checking of provided key from self instance
      // todo rewrite without using Vue internals
      this._provided = {
        setStyle: ::this.setFallbackStyle,
        getStyle: ::this.getFallbackStyle
      }
    }
  }
</script>

<style>/* stub styles */</style>
