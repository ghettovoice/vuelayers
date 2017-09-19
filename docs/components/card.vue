<template lang="pug">
  section.card(:class="[$options.name]")
    header.card-header(v-if="$slots.header && $slots.header.length")
      slot(name="header")
    div.card-image(v-if="$slots.image && $slots.image.length")
      slot(name="image")
    div.card-content
      slot
    footer.card-footer(v-if="$slots.footer && $slots.footer.length")
      slot(name="footer")
</template>

<script>
  export default {
    name: 'vld-card',
  }
</script>
