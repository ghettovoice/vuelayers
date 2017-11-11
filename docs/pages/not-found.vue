<template lang="pug">
  div(:class="[$options.name]")
    vld-hero(':bold'="true" color="is-warning")
      h1.title 404 Not Found
      h2.subtitle There is nothing to do here

    section.section.content
      p Go to #[router-link(to="/", title="VueLayers Homepage") Home]
</template>

<script>
  const props = {
  }

  export default {
    name: 'vld-not-found-page',
    props,
  }
</script>
