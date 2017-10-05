<template lang="pug">
  div(:class="[$options.name]")
    div.level
      div.level-left
        div.level-item
          b.title(v-if="title && title.length") {{ title }}
      div.level-right
        div.level-item
          button.copy.button.is-small(ref="copy" title="Copy to clipboard")
            b-icon(icon="copy" size="is-small")
            span Copy
    pre
      code(:class='[lang]' ref='code')
        slot
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
    &:not(:last-child)
      margin-bottom: 1em
    .title
      font-size: 1.2rem
      font-weight: bold
    .level
      margin-bottom: .25rem
</style>
