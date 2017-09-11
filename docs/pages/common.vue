<template>
  <div class="common">
    <vld-hero :bold="bold" :color="color">
      <h1 class="title">{{ title }}</h1>
      <h2 class="subtitle" v-if="subtitle">{{ subtitle }}</h2>
    </vld-hero>

    <section class="section">
      <slot></slot>
    </section>
  </div>
</template>

<script>
  import page from './page'

  const props = {
  }

  export default {
    name: 'vld-common-page',
    mixins: [page],
    props,
  }
</script>

<style></style>
