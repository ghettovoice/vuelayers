import Vue from 'vue'
import ol from 'openlayers'
import { isFunction } from 'lodash/fp'
import { createStyleFunc } from 'vl-components/style/target'
import { style as styleHelper } from 'vl-ol'

/**
 * Directive for advanced low-level dynamic styling using ol.StyleFunction.
 * Can be applied on styleable components that use styleTarget mixins
 */
export default {
  name: 'style-func',
  bind (el, binding, vnode) {
    const component = vnode.componentInstance
    const styleFunctionFactory = binding.value

    if (!isFunction(styleFunctionFactory) || !component.styleTarget()) return

    bindStyleFunction(styleFunctionFactory(ol, styleHelper), component)
  },
  unbind (el, binding, vnode) {
    const component = vnode.componentInstance
    if (component.styleTarget()) {
      component.setStyle(component.styles)
    }
  },
  update (el, binding, vnode) {
    // todo rebind style function? need test
  }
}

function bindStyleFunction (styleFunc, component) {
  const defStyleFunc = createStyleFunc(component)

  Vue.nextTick(() => {
    component.styleTarget().setStyle(function __directiveStyleFunc (feature, resolution) {
      let styles = styleFunc(feature, resolution)

      if (styles === null || (Array.isArray(styles) && styles.length)) {
        return styles
      }

      return defStyleFunc(feature, resolution)
    })
  })
}
