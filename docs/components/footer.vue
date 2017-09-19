<template lang="pug">
  footer.footer(:class="[$options.name]")
    div.columns
      div.column(:class="leftMods")
        slot(name="left")
      div.column(:class="rightMods")
        slot(name="right")
    div.main(:class="mainMods")
      slot
</template>

<script>
  const props = {
    mainMods: String,
    leftMods: String,
    rightMods: String,
  }

  export default {
    name: 'vld-footer',
    props,
  }
</script>

<style lang="sass">
  .vld-footer
    padding-bottom: 3rem
</style>
