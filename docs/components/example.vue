<template lang="pug">
  div(':class'="[$options.name]")
    b.title(v-if="title && title.length") {{ title }}
    b-tabs(ref="tabs" '@change'="tabChanged")
      slot
</template>

<script>
  import { debounce } from 'lodash/fp'
  import Vue from 'vue'

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
        }
      })
    }),
    compileTabs () {
      this.$refs.tabs.tabItems.forEach(tab => {
        if (tab.$el.hasAttribute('compile')) {
          /* eslint-disable no-new */
          new Vue({
            name: 'vld-proxy',
            el: tab.$el.children[0],
            parent: tab,
            methods: {
              updateSize () {
                this.$children.forEach(vm => {
                  if (typeof vm.updateSize === 'function') {
                    vm.updateSize()
                  }
                })
              },
            },
          })
          console.log(tab)
        }
      })
    },
  }

  export default {
    name: 'vld-example',
    props,
    computed,
    methods,
    mounted () {
      this.compileTabs()
    },
  }
</script>

<style lang="sass">
  @import ../styles/variables

  .vld-example
    .title
      font-size: 1.2em
</style>
