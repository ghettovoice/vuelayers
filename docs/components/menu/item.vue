<template lang="pug">
  li(:class="$options.name")
    slot(@click="onClick")
</template>

<script>
  const props = {
  }

  const methods = {
    onClick () {
      this.$emit('click')
    },
  }

  export default {
    name: 'vld-menu-item',
    props,
    methods,
  }
</script>

<style lang="sass">
  @import ../../styles/variables

  .vld-menu-item
    span
      border-radius: $menu-item-radius
      color: $menu-item-color
      display: block
      padding: 0.5em 0.75em
      &:hover
        background-color: $menu-item-hover-background-color
        color: $menu-item-hover-color
      // Modifiers
      &.is-active
        background-color: $menu-item-active-background-color
        color: $menu-item-active-color
</style>
