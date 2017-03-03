import Vue from 'vue'
import { isFunction } from 'lodash/fp'
import { createStylesFilter } from 'vl-components/style/target'

/**
 * Directive for advanced low-level dynamic styling using ol.StyleFunction.
 * Can be applied on styleable components that use styleTarget mixins
 */
export default {
  name: 'style-func',
  bind (el, binding, vnode) {
    const component = vnode.componentInstance
    const styleFunction = binding.value

    if (!isFunction(styleFunction)) return

    bindStyleFunction(styleFunction, component)
  },
  unbind (el, binding, vnode) {
    const component = vnode.componentInstance
    if (component.styleTarget()) {
      component.styleTarget().setStyle(component.styles)
    }
  },
  update (el, binding, vnode) {
    // todo rebind style function? need test
  }
}

function bindStyleFunction (styleFunction, component) {
  const defStylesFilter = createStylesFilter(component.styles)

  Vue.nextTick(() => {
    component.styleTarget().setStyle((feature, resolution) => {
      let styles = styleFunction(feature, resolution)

      if (styles == null || !styles.length) {
        return defStylesFilter(feature, resolution)
      }

      return styles
    })
  })
}
