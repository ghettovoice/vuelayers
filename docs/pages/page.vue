<template>
  <div>
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
  const props = {
    title: {
      type: String,
      required: true,
    },
    subtitle: String,
    color: String,
    bold: Boolean,
  }

  export default {
    name: 'vld-page',
    props,
  }
</script>
