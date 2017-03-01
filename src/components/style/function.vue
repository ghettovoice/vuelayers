<template>
  <i style="display: none !important">
    <slot :feature="feature"></slot>
  </i>
</template>

<script>
  import style from 'vuelayers/src/mixins/style/style'

  const methods = {
    createStyle () {
      return (feature, resolution) => {
        // todo как то прокидывать feature наружу, scoped slots? render function?
        this.feature = feature.vm.data
        console.log(this.feature.color, this.styles[0].getFill().getColor())
        return this.styles
      }
    },
    append () {
      this.styleTarget.setStyle(this.style)
    },
    remove () {
      this.styleTarget.setStyle(undefined)
    },
    getStyleTarget () {
      this.styles = []
      return {
        getStyle: () => {
          return this.styles
        },
        setStyle: (style) => {
          this.styles = style
        }
      }
    }
  }

  export default {
    name: 'vl-style-function',
    mixins: [ style ],
    methods,
    data () {
      return {
        feature: undefined
      }
    }
  }
</script>

<style>/* stub styles */</style>
