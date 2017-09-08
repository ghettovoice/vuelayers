<template>
  <nav class="navbar" :class="{ 'is-transparent': transparent }">
    <div class="navbar-brand">
      <slot name="brand"></slot>

      <div class="navbar-burger" ref="menuBtn" @click="onMenuClick">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class="navbar-menu" ref="menu">
      <div class="navbar-start">
        <slot name="start"></slot>
      </div>
      <div class="navbar-end">
        <slot name="end"></slot>
      </div>
    </div>
  </nav>
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

<style lang="sass">
</style>
