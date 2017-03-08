import Vue from 'vue'
import { reduce } from 'lodash/fp'

const reduceWithKey = reduce.convert({ cap: false })

const Comp = Vue.extend({
  functional: true,
  render (h, { props, children, parent, data }) {
    data.hook = {
      // create (vnode) {
      //   vnode.parent = undefined
      // },
      insert (vnode) {
        console.log(vnode)
        if (vnode.elm.parentNode) {
          vnode.elm.parentNode.removeChild(vnode.elm)
        }
      },
      postpatch (oldNode, vnode) {
        if (vnode.elm.parentNode) {
          vnode.elm.parentNode.removeChild(vnode.elm)
        }
      }
    }
    data.attrs = {
      id: 'vl-virt'
    }

    return h('i', data, children)
  }
})

export default {
  // updated () {
  //   this::mount()
  //   console.log('updated')
  // },
  // mounted () {
  //   this::mount()
  // },
  // destroyed () {
  //   console.log('updated')
  // },
  render (h) {
    const options = this.$options.virtSlot || {}

    return h(Comp, extractChildren(this.$slots, options.slots))
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

// function mount () {
//   this.$nextTick(() => {
//     const options = this.$options.virtSlot || {}
//
//     if (options.slots) {
//       options.slots.forEach(mountSlotComponents(this, this.$slots))
//     }
//   })
// }
//
// function mountSlotComponents (vm, slots = {}) {
//   return function _mountSlot (name) {
//     (slots[ name ] || []).forEach(mountComponent(vm))
//   }
// }

// function mountComponent (parent) {
//   return function __mount (vnode) {
//     if (!vnode.componentInstance && vnode.componentOptions) {
//       vnode.children = vnode.componentOptions.children
//
//       const comp = vnode.componentInstance = createComponentInstanceForVnode(vnode, parent)
//       comp.$mount()
//
//       if (comp.$children) {
//         comp.$children.forEach(vm => vm.$mount())
//       }
//     }
//
//     return vnode.componentInstance
//   }
// }
// function createComponentInstanceForVnode (vnode, parent) {
//   const vnodeComponentOptions = vnode.componentOptions
//   const options = {
//     parent,
//     propsData: vnodeComponentOptions.propsData,
//     _isComponent: true,
//     _componentTag: vnodeComponentOptions.tag,
//     _parentListeners: vnodeComponentOptions.listeners,
//     _renderChildren: vnodeComponentOptions.children
//   }
//   return new vnodeComponentOptions.Ctor(options)
// }
