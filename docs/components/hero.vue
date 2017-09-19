<template lang="pug">
  section.hero(:class="[$options.name, color, bold ? 'is-bold' : '', size]")
    div.hero-body
      slot
</template>

<script>
  const props = {
    color: String,
    bold: Boolean,
    size: String,
  }

  export default {
    name: 'vld-hero',
    props,
  }
</script>
