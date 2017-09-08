<template>
  <aside class="sidebar">
    <div class="logo" v-if="$slots.logo && $slots.logo.length">
      <slot name="logo"></slot>
    </div>
    <div class="links" v-if="$slots.links && $slots.links.length">
      <slot name="links"></slot>
    </div>
    <div class="main">
      <slot></slot>
    </div>
  </aside>
</template>

<script>
  const props = {
  }

  export default {
    name: 'vld-sidebar',
    props,
  }
</script>

<style lang="sass">
  @import ../sass/variables

  .sidebar
    padding: 0 1rem
    > *
      margin: .5rem 0

  .logo
    text-align: center
    font-size: 1.2em

  .links
    text-align: center
    a
      color: $text-light
      &:hover
        color: $text
</style>
