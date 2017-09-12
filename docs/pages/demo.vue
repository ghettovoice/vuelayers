<template>
  <div class="demo">
    <vld-hero :bold="bold" :color="color">
      <h1 class="title">{{ title }}</h1>
      <h2 class="subtitle">{{ subtitle }}</h2>
    </vld-hero>

    <vld-demo-app />

    <section class="section">
      <p class="subtitle">Demo app source code</p>
      <b-tabs>
        <b-tab-item label="JS">
          <vld-js-src />
        </b-tab-item>
        <b-tab-item label="HTML">
          <vld-html-src />
        </b-tab-item>
      </b-tabs>
    </section>
  </div>
</template>

<script>
  import page from './page'
  import VldJsSrc from '../md/demo/js-src.md'
  import VldHtmlSrc from '../md/demo/html-src.md'

  const props = {}

  export default {
    name: 'vld-demo-page',
    mixins: [page],
    components: {
      VldJsSrc,
      VldHtmlSrc,
    },
    props,
  }
</script>
