// import { reduce } from 'vl-utils/func'

export default {
  // render (h) {
  //   const options = this.$options.virtSlot || {}
  //   this.virt = h('i', extractChildren(this.$slots, options.slots))
  //
  //   return h()
  // },
  // updated () {
  //
  // }
  render (h) {
    const data = {
      attrs: {
        id: 'vl-virt'
      },
      hook: {
        insert: vnode => {
          if (vnode.elm && vnode.elm.parentNode) {
            vnode.elm.parentNode.removeChild(vnode.elm)
          }
        }
      }
    }

    return h('i', data)
  }
}

// function extractChildren (slots, slotNames = []) {
//   return reduce((all, nodes, name) => {
//     if (!slotNames.length || slotNames.includes(name)) {
//       all = all.concat(nodes)
//     }
//
//     return all
//   }, [], slots)
// }
