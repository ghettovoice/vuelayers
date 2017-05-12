<template>
  <section id="page">
    <h1 class="title">{{ pageTitle }}</h1>
    <h2 class="subtitle">{{ subTitle }}</h2>
    <hr>
    show map behind text, as bg
  </section>
</template>

<script>
  /* global PKG_FULLNAME, PKG_DESCRIPTION, PKG_KEYWORDS */
  import { constant } from 'lodash/fp'

  const computed = {
    // move to seo mixin
    pageTitle: constant(PKG_FULLNAME),
    subTitle: constant(PKG_DESCRIPTION)
  }

  export default {
    name: 'page-home',
    meta: {
      title: 'Home',
      pageTitle: 'Home',
      description: PKG_DESCRIPTION,
      keywords: PKG_KEYWORDS,
      menu: 'top' // todo add constants
    },
    computed
  }
</script>

<style></style>
