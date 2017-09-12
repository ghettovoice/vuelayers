<template>
  <div class="demo">
    <vld-hero :bold="bold" :color="color">
      <h1 class="title">{{ title }}</h1>
      <h2 class="subtitle">{{ subtitle }}</h2>
    </vld-hero>

    <vld-demo-app />

    <section class="section">
      <h3 class="title">Source code</h3>
      <b-tabs>
        <b-tab-item label="JS">
          <vld-demo-script/>
        </b-tab-item>
        <b-tab-item label="HTML">
          <vld-demo-template/>
        </b-tab-item>
        <b-tab-item label="SASS">
          <vld-demo-style/>
        </b-tab-item>
      </b-tabs>
    </section>
  </div>
</template>

<script>
  import page from './page'
  import VldDemoScript from '../md/demo/script.md'
  import VldDemoTemplate from '../md/demo/template.md'
  import VldDemoStyle from '../md/demo/style.md'

  const props = {}

  export default {
    name: 'vld-demo-page',
    mixins: [page],
    components: {
      VldDemoScript,
      VldDemoTemplate,
      VldDemoStyle,
    },
    props,
  }
</script>
