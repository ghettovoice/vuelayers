<script>
  /**
   * ol.style.Style wrapper.
   * Acts as an style container that will be injected into "style" slot inside layer or feature components.
   * All style box components inside style slot would be returned from layer/feature style function.
   * See layer mixin and components.
   */
  import ol from 'openlayers'
  import { isFunction } from 'lodash/fp'
  import { warn } from 'vuelayers/src/utils/debug'
  import style from 'vuelayers/src/mixins/style'

  const props = {
    zIndex: Number
  }

  const methods = {
    /**
     * @return {ol.style.Style}
     * @protected
     */
    createStyle () {
      return new ol.style.Style({
        zIndex: this.zIndex
      })
    },
    append () {
      if (!this.styleTarget) return

      let currentStyle = this.styleTarget.getStyle() || []
      if (isFunction(currentStyle)) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Target has style as ol.StyleFunction, current style will be override by component. ' +
               'To append style container you should define style as Array or ol.style.Style instance on the target')
        }

        currentStyle = this.style
      }

      if (currentStyle instanceof ol.style.Style) {
        currentStyle = [ currentStyle ]
      }

      currentStyle.push(this.style)
      this.styleTarget.setStyle(currentStyle)
    },
    remove () {
      if (!this.styleTarget) return

      let currentStyle = this.styleTarget.getStyle() || []
      if (isFunction(currentStyle)) {
        if (process.env.NODE_ENV !== 'production') {
          warn('Target has style as ol.StyleFunction. To remove style container you should define style as Array or ol.style.Style instance on the target')
        }
        return
      }

      if (currentStyle instanceof ol.style.Style && currentStyle === this.style) {
        this.styleTarget.setStyle(undefined)
        return
      }

      currentStyle = currentStyle.filter(style => style !== this.style)
      currentStyle.length || (currentStyle = undefined)
      this.styleTarget.setStyle(currentStyle)
    }
  }

  const watch = {
    zIndex (value) {
      this.style.setZIndex(value)
    }
  }

  export default {
    name: 'vl-style-container',
    mixins: [ style ],
    props,
    methods,
    watch,
    render (h) {
      return h('i', {
        style: {
          display: 'none'
        }
      }, this.$slots.default)
    }
  }

</script>

<style>/* stub styles */</style>
