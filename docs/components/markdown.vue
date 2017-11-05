<template lang="pug">
  vue-markdown.content(
    ':class'="[$options.name]"
    lang-prefix="hljs "
    ':breaks'="false"
    ':xhtml-out'="false"
    ':anchorAttributes'="{ target: '_blank' }"
  )
    slot
</template>

<script>
  export default {
    name: 'vld-markdown',
  }
</script>

<style>
</style>
