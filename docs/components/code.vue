<template lang="pug">
  p(:class="[$options.name]")
    b(v-if="title && title.length") {{ title }}
    pre
      code(:class='[lang]' ref='code')
        slot
</template>

<script>
  // noinspection JSFileReferences
  import hljs from 'highlight.js'

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
    },
  }
</script>
