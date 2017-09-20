<template lang="pug">
  nav.navbar(:class="{ 'is-transparent': transparent, [$options.name]: true }")
    div.navbar-brand
      slot(name="brand")

      div.navbar-burger(ref="menuBtn" '@click'="onNavBurgerClick" ':class'="{'is-active': isMenuActive}")
        span/
        span/
        span/
    div.navbar-menu(ref="menu" ':class'="{'is-active': isMenuActive}")
      div.navbar-start
        slot(name="start")
      div.navbar-end
        slot(name="end")
</template>

<script>
  const props = {
    transparent: Boolean,
    menuActive: Boolean,
  }

  const methods = {
    onNavBurgerClick () {
      this.isMenuActive = !this.isMenuActive
      this.$emit('update:menuActive', this.isMenuActive)
    },
  }

  const watch = {
    menuActive (value) {
      if (value !== this.isMenuActive) {
        this.isMenuActive = value
      }
    },
  }

  export default {
    name: 'vld-navbar',
    props,
    methods,
    watch,
    data () {
      return {
        isMenuActive: this.menuActive,
      }
    },
  }
</script>
