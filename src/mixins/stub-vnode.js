import { isFunction, isString, reduce } from 'lodash/fp'

const reduceWithKey = reduce.convert({ cap: false })

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

    return h(
      options.tag || 'i',
      {
        attrs,
        style: {
          display: 'none !important'
        }
      },
      children
    )
  }
}

function extractChildren (slots, slotNames = []) {
  return reduceWithKey((all, vnodes, name) => {
    if (!slotNames.length || slotNames.includes(name)) {
      all = all.concat(vnodes)
    }

    return all
  }, [], slots)
}
