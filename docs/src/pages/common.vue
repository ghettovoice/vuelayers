<template>
  <div class="page" :class="additionalContainerCls">
    <section class="hero" :class="[ currentMainHeroCls ]">
      <div class="hero-body">
        <h1 class="title">{{ currentTitle }}</h1>
        <h2 class="subtitle">{{ currentSubtitle }}</h2>
      </div>
    </section>

    <section class="content" v-html="contentWithoutH1"></section>
  </div>
</template>

<script>
  import { constant } from 'lodash/fp'

  const props = {
    title: String,
    subtitle: String,
    content: String,
    /**
     * Header Hero block class
     */
    mainHeroCls: String
  }

  const computed = {
    currentTitle () {
      return this.title.trim()
    },
    currentSubtitle () {
      return this.subtitle.trim()
    },
    currentContent () {
      return this.content.trim()
    },
    contentWithoutH1 () {
      return this.currentContent.replace(/^<h1[^>]*>[a-zа-яё\d\s]+<\/h1>/imu, '').trim()
    },
    currentMainHeroCls () {
      return this.mainHeroCls
    },
    // for child components without custom template
    additionalContainerCls: constant('')
  }

  export default {
    name: 'page-common',
    props,
    computed
  }
</script>

<style lang="scss">
  .page {
    .hero-body {
      padding : 3rem 1.5rem;
    }

    .content {
      padding : 1.5rem;
    }
  }
</style>
