<template>
  <div class="demo">
    <vld-hero :bold="true" color="is-primary">
      <h1 class="title">C_PKG_FULLNAME demo app</h1>
      <h2 class="subtitle">An example app based on C_PKG_FULLNAME.js</h2>
    </vld-hero>

    <vld-demo-app />

    <section class="section">
      <vld-demo-app-sources />
    </section>
  </div>
</template>

<script>
  import VldDemoAppSources from '../partial/demo-app-sources.md'

  export default {
    name: 'vld-demo-page',
    components: {
      VldDemoAppSources,
    },
  }
</script>
