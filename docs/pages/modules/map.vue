<template lang="pug">
  div(:class="[$options.name]")
    vld-hero(:bold="bold", :color="color")
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    section.section
      map-doc

      h4#vl-map.subtitle
      map-map-doc
</template>

<script>
  import page from '../page'
  /* eslint-disable import/no-webpack-loader-syntax */
  import MapDoc from '!jsdoc-vue-loader!../../jsdoc-index.json?longname=module:map&tpl=./template.ejs'
  import MapMapDoc from '!jsdoc-vue-loader!../../jsdoc-index.json?longname=module:map/map&vueProto=vl-map&tpl=./template.ejs'
  /* eslint-enable import/no-webpack-loader-syntax */

  export default {
    name: 'vld-map-page',
    mixins: [page],
    components: {
      MapDoc,
      MapMapDoc,
    },
  }
</script>
