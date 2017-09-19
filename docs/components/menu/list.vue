<template lang="pug">
  div(:class="$options.name")
    p.menu-label(v-if="label") {{ label }}
    ul.menu-list
      slot
</template>

<script>
  const props = {
    label: String,
  }

  export default {
    name: 'vld-menu-list',
    props,
  }
</script>

<style lang="sass">
  .vld-menu-list
    .menu-label
      margin-top: 1em
      margin-bottom: 1em
</style>
