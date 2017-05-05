<template>
  <section id="page" class="section">
    <h1 class="title">{{ pageTitle }}</h1>
    <hr>
  </section>
</template>

<script>
  import { constant } from 'lodash/fp'

  const computed = {
    pageTitle: constant('404 Not Found')
  }

  export default {
    name: 'not-found',
    meta: {
      title: '404 Not Found'
    },
    computed
  }
</script>

<style></style>
