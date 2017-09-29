<template lang="pug">
  div(:class="[$options.name]")
    vld-hero(:bold="bold", :color="color")
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    section.section
      component(':is'="docCmp")
</template>

<script>
  import page from './page'

  const props = {
    docCmp: {
      type: [String, Object, Function],
      required: true,
    },
  }

  export default {
    name: 'vld-doc-page',
    mixins: [page],
    props,
  }
</script>

<style>
</style>
