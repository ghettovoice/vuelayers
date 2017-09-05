<template>
  <div class="menu-group">
    <p v-if="label" class="menu-label">
      {{ label }}
    </p>
    <ul class="menu-list">
      <slot></slot>
    </ul>
  </div>
</template>

<script>
  const props = {
    label: String,
  }

  export default {
    name: 'list',
    props,
  }
</script>

<style>
</style>
