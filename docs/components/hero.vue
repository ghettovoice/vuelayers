<template>
  <section class="hero" :class="[color, bold ? 'is-bold' : '', size]">
    <div class="hero-body">
      <slot></slot>
    </div>
  </section>
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

<style>
</style>
