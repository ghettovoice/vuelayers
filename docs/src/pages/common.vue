<template>
  <div class="page common">
    <section class="hero is-primary">
      <div class="hero-body">
        <h1 class="title">{{ title }}</h1>
        <h2 class="subtitle">{{ subtitle }}</h2>
      </div>
    </section>

    <section class="content" v-html="content"></section>
  </div>
</template>

<script>
  const props = {
    title: String,
    subtitle: String,
    content: String
  }

  export default {
    props
  }
</script>

<style lang="scss">
  .common.page {
    .hero-body {
      padding : 3rem 1.5rem;
    }

    .content {
      padding : 1.5rem;
    }
  }
</style>
