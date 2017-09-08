<template>
  <div class="menu-list-container">
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
    name: 'vld-list',
    props,
  }
</script>

<style lang="sass">
  .menu-list-container
    .menu-label
      margin-top: 1em
      margin-bottom: 1em
</style>
