<template>
  <div class="demo">
    <vld-hero :bold="bold" :color="color">
      <h1 class="title">{{ title }}</h1>
      <h2 class="subtitle">{{ subtitle }}</h2>
    </vld-hero>

    <vld-demo-app />

    <section class="section">
      <vld-demo-content/>
    </section>
  </div>
</template>

<script>
  import page from './page'
  import VldDemoContent from '../md/demo.md'

  const props = {}

  export default {
    name: 'vld-demo-page',
    mixins: [page],
    components: {
      VldDemoContent,
    },
    props,
  }
</script>
