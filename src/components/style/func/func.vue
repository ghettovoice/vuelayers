<script>
  import ol, { style as styleHelper } from 'vl-ol'
  import style from 'vl-components/style/style'
  import { warn } from 'vl-utils/debug'

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
      const self = this
      const styleFunc = this.factory(ol, styleHelper)

      return function __styleFunc (feature, resolution) {
        const plainFeature = feature.plain()

        return styleFunc(plainFeature, resolution)
      }
    },
    mountStyle () {
      if (this.getStyle()) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Style target already have defined styles, will be replaced with style function')
        }
      }

      this.setStyle(this.style)
    },
    unmountStyle () {
      this.setStyle(undefined)
    }
  }

  const watch = {
    factory () {}
  }

  export default {
    name: 'vl-style-func',
    mixins: [ style ],
    inject: [ 'setStyle', 'getStyle' ],
    props,
    watch,
  }
</script>

<style>/* stub styles */</style>
