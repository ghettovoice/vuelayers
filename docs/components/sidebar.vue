<template>
  <aside class="sidebar" :class="[size]">
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
    size: String,
  }

  export default {
    name: 'vl-sidebar',
    props,
  }
</script>

<style lang="sass">
  @import ../sass/variables

  .sidebar
    > *
      padding: .25em .75em

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
