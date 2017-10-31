<template lang="pug">
  div(:class="[$options.name]")
    b.title(v-if="title && title.length") {{ title }}
    pre(v-highlight)
      code(':class'='lang' ref='code')
        slot
      button.copy.button.is-small(ref="copy" title="Copy to clipboard")
        b-icon(icon="clipboard" size="is-small")
        span Copy
</template>

<script>
  import Clipboard from 'clipboard'

  const props = {
    title: String,
    lang: String,
  }

  const methods = {
  }

  export default {
    name: 'vld-code',
    props,
    methods,
    mounted () {
      this.clipboard = new Clipboard(this.$refs.copy, {
        target: () => this.$refs.code,
      })
      this.clipboard.on('success', (event) => {
        event.clearSelection()
        this.$toast.open({
          message: 'Copied to clipboard!',
          type: 'is-success',
        })
      })
    },
    beforeDestroy () {
      this.clipboard.destroy()
    },
  }
</script>

<style lang="sass">
  @import ../styles/variables

  .vld-code
    position: relative
    &:not(:last-child)
      margin-bottom: 1em
    pre
      position: relative
      .copy
        opacity: 0
        position: absolute
        right: .25em
        top: .25em
        transition: opacity .3s ease-out
      &:hover
        .copy
          opacity: 1
    .title
      font-size: 1.2em
</style>
