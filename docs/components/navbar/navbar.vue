<template lang="pug">
  nav.navbar(:class="{ 'is-transparent': transparent, [$options.name]: true }")
    div.navbar-brand
      slot(name="brand")

      div.navbar-burger(ref="menuBtn", @click="onMenuClick")
        span/
        span/
        span/
    div.navbar-menu(ref="menu")
      div.navbar-start
        slot(name="start")
      div.navbar-end
        slot(name="end")
</template>

<script>
  const props = {
    transparent: Boolean,
  }

  const methods = {
    onMenuClick () {
      this.$refs.menuBtn.classList.toggle('is-active')
      this.$refs.menu.classList.toggle('is-active')
    },
  }

  export default {
    name: 'vld-navbar',
    props,
    methods,
  }
</script>
