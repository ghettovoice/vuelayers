<template lang="pug">
  div(':id'="module"  ':class'="[$options.name]")
    vld-hero(:bold="bold", :color="color")
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    section.section
      component(':is'="module")
</template>

<script>
  import page from './page'

  const props = {
    module: {
      type: [String, Object, Function],
      required: true,
    },
  }

  const computed = {
  }

  const methods = {
  }

  export default {
    name: 'vld-doc-page',
    mixins: [page],
    props,
    computed,
    methods,
  }
</script>

<style>
</style>
