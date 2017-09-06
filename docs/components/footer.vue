<template>
  <footer class="footer">
    <div class="columns">
      <div class="column" :class="leftMods">
        <slot name="left"></slot>
      </div>
      <div class="column" :class="rightMods">
        <slot name="right"></slot>
      </div>
    </div>
    <div class="main" :class="mainMods">
      <slot></slot>
    </div>
  </footer>
</template>

<script>
  const props = {
    mainMods: String,
    leftMods: String,
    rightMods: String,
  }

  export default {
    name: 'vl-footer',
    props,
  }
</script>

<style>
</style>
