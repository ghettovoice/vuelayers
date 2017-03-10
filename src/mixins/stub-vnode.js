import { isFunction, isString, reduce } from 'vl-utils/func'

export default {
  render (h) {
    const options = this.$options.stubVNode || {}
    // render as HTML comment
    if (options.empty) {
      let vnode = h()
      if (isString(options.empty)) {
        vnode.text = options.empty
      } else if (isFunction(options.empty)) {
        vnode.text = this::options.empty()
      }

      return vnode
    }

    let children
    if (options.slots === false) {
      children = undefined
    } else {
      children = extractChildren(this.$slots, options.slots)
    }

    let attrs = isFunction(options.attrs)
      ? this::options.attrs()
      : options.attrs

    let data = {
      attrs,
      style: {
        display: 'none !important'
      }
    }

    return h(options.tag || 'i', data, children)
  }
}

function extractChildren (slots, slotNames = []) {
  return reduce((all, nodes, name) => {
    if (!slotNames.length || slotNames.includes(name)) {
      all = all.concat(nodes)
    }

    return all
  }, [], slots)
}
