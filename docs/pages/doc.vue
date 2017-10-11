<template lang="pug">
  div(':class'="[$options.name]")
    vld-hero(:bold="bold", :color="color")
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    section.section
      template(v-for="(doc, i) in docs")
        component(':is'="doc" ':key'="i")
</template>

<script>
  import page from './page'

  const props = {
    docs: {
      type: Array,
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
