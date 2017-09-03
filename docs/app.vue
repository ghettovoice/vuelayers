<template>
  <div id="app">
    <progress-bar type="circle" ref="line" :options="options" />

    <header id="header" class="header">
    </header>

    <main id="main" class="main">
    </main>

    <footer id="footer" class="footer">
    </footer>
  </div>
</template>

<script>
  function loopAnimate (target) {
    target.animate(1.0, () => {
      setTimeout(target.animate(0, () => {
        setTimeout(loopAnimate(target), 10)
      }), 10)
    })
  }

  export default {
    data () {
      return {
        options: {
          color: '#007AFF',
          strokeWidth: 0.5,
          duration: 1200
        }
      }
    },
    mounted: function () {
      loopAnimate(this.$refs.line)
    }
  }
</script>

<style lang="sass">
  /*! VueLayers.js site */
  @import sass/variables
  // Import Bulma and Buefy styles
  @import ~bulma/bulma
  @import sass/helpers
  @import sass/base
  @import sass/loader

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
