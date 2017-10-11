<template lang="pug">
  div(:class="[$options.name]")
    b.title(v-if="title && title.length") {{ title }}
    pre
      code(:class='[lang]' ref='code')
        slot
      button.copy.button(ref="copy" title="Copy to clipboard")
        b-icon(icon="copy" size="is-small")
        span Copy
</template>

<script>
  // noinspection JSFileReferences
  import hljs from 'highlight.js'
  import Clipboard from 'clipboard'

  const props = {
    title: String,
    lang: String,
  }

  const methods = {
    reindent () {
      const block = this.$refs.code
      let lines = block.textContent.split('\n')
      let matches
      if (lines[0] === '') {
        lines.shift()
      }
      let indentation = (matches = (/^[\s\t]+/).exec(lines[0])) !== null ? matches[0] : null
      if (indentation) {
        lines = lines.map(function (line) {
          line = line.replace(indentation, '')
          return line.replace(/\t/g, '  ')
        })
        block.textContent = lines.join('\n').trim()
      }
    },
  }

  export default {
    name: 'vld-code',
    props,
    methods,
    mounted () {
      this.reindent()
      hljs.highlightBlock(this.$refs.code)

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
    pre
      position: relative
    &:not(:last-child)
      margin-bottom: 1em
    .title
      font-size: 1.2rem
      font-weight: bold
    .copy
      opacity: 0
      position: absolute
      right: .25em
      top: .25em
      transition: opacity .3s ease-out
    &:hover
      .copy
        opacity: 1
</style>
