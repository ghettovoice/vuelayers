<template>
  <section class="card">
    <header class="card-header" v-if="$slots.header && $slots.header.length">
      <slot name="header"></slot>
    </header>
    <div class="card-image" v-if="$slots.image && $slots.image.length">
      <slot name="image"></slot>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
    <footer class="card-footer" v-if="$slots.footer && $slots.footer.length">
      <slot name="footer"></slot>
    </footer>
  </section>
</template>

<script>
  export default {
    name: 'vld-card',
  }
</script>

<style>
</style>
