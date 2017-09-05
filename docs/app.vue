<template>
  <main id="app">
    <aside id="left-sidebar" class="is-left"></aside>

    <section id="page" class="page">
    </section>

    <footer id="footer" class="footer">
    </footer>
  </main>
</template>

<script>
  export default {
    name: 'app',
  }
</script>

<style lang="sass">
  /*! VueLayers.js site */
  // import theme variables
  @import sass/variables
  // Import Bulma and Buefy styles
  @import ~bulma
  @import ~buefy/src/scss/buefy
  // import other
  @import sass/helpers
  @import sass/base
</style>
