<template>
  <nav class="navbar">
    <div class="navbar-brand" v-if="$slots.logo && $slots.logo.length">
      <slot name="logo"></slot>
    </div>
  </nav>
</template>

<script>
  export default {
    name: 'vl-navbar',
  }
</script>

<style>
</style>
