<template lang="pug">
  aside.sidebar(:class="[$options.name]")
    div.logo(v-if="$slots.logo && $slots.logo.length")
      slot(name="logo")
    div.links(v-if="$slots.links && $slots.links.length")
      slot(name="links")
    div.main
      slot
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
  @import ../styles/variables

  .vld-sidebar
    padding: 0 1rem
    > *
      margin: .5rem 0

    .logo
      text-align: center

    .links
      text-align: center
      a
        color: $text-light
        &:hover
          color: $text
</style>
