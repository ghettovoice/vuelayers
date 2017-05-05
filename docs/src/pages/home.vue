<template>
  <section id="page">
    <h1 class="title">{{ pageTitle }}</h1>
    <h2 class="subtitle">{{ subTitle }}</h2>
    <hr>
  </section>
</template>

<script>
  /* global PKG_FULLNAME, PKG_DESCRIPTION */
  import { constant } from 'lodash/fp'

  const computed = {
    pageTitle: constant(PKG_FULLNAME),
    subTitle: constant(PKG_DESCRIPTION)
  }

  export default {
    name: 'home',
    meta: {
      title: 'Home',
      description: PKG_DESCRIPTION
    },
    computed
  }
</script>

<style></style>
