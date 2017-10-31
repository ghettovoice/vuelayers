<template lang="pug">
  vue-markdown.content(
    ':class'="[$options.name]"
    lang-prefix="hljs "
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
