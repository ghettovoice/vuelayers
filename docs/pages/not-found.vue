<template lang="pug">
  div.not-found
    vld-hero(:bold="bold", :color="color")
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    section.section.content
      p Go to <router-link to="/" title="C_PKG_FULLNAME Homepage">Home</router-link>
</template>

<script>
  import page from './page'

  const props = {
  }

  export default {
    name: 'vld-not-found-page',
    mixins: [page],
    props,
  }
</script>

<style>
</style>
