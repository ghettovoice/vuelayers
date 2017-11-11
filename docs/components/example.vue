<template lang="pug">
  div(':class'="[$options.name]")
    b.title(v-if="title && title.length") {{ title }}
    b-tabs(ref="tabs" '@change'="tabChanged")
      slot
</template>

<script>
  import { debounce } from 'lodash/fp'

  const props = {
    title: String,
  }

  const computed = {
    tabbed () {
      return (this.$slots.default && this.$slots.default.length) || 0
    },
  }

  const methods = {
    tabChanged: debounce(100, function (i) {
      let tab = this.$refs.tabs.tabItems[i]
      if (!tab) return

      tab.$children.forEach(vm => {
        if (typeof vm.updateSize === 'function') {
          vm.updateSize()
        } else {
          vm.$children.forEach(vm => {
            if (typeof vm.updateSize === 'function') {
              vm.updateSize()
            }
          })
        }
      })
    }),
  }

  export default {
    name: 'vld-example',
    props,
    computed,
    methods,
  }
</script>

<style lang="sass">
  @import ../styles/variables

  .vld-example
    &:not(:last-child)
      margin-bottom: 1rem
    .title
      font-size: 1.2em
</style>
