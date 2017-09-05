<template>
  <div id="app">
    <header id="header" class="header">
    </header>

    <main id="main" class="main">
    </main>

    <footer id="footer" class="footer">
    </footer>
  </div>
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

  // Page loader
  #page-loader
    position: absolute
    left: 0
    top: 0
    right: 0
    bottom: 0
    background: $white
    z-index: 99999
    opacity: 1
    transition: opacity ease-out 1s

    .rotating-loader
      position: absolute
      top: 50%
      left: 50%
      margin-top: -40px
      margin-left: -40px

    &.hidden
      opacity: 0

  // header
  #header
    width: 100%

  // Sidebars
  #left-sidebar
    // Menu
    .menu
      padding: 1rem .75rem

      +desktop()
        padding: 1.25rem

  // Main section
  #main
    position: relative
    width: 100%

  // Footer
  #footer
    position: relative
</style>
