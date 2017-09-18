<template lang="pug">
  div.demo
    vld-hero(:bold='bold', :color='color')
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    vld-demo-app/

    section.section.content
      h3.title Source code
      b-tabs
        b-tab-item(label='JS')
          vld-code(lang="js") {{ script }}
        b-tab-item(label='HTML')
          vld-code(lang="html") {{ template }}
        b-tab-item(label='SASS')
          vld-code(lang="styl") {{ style }}
</template>

<script>
  import page from './page'
  // eslint-disable-next-line import/no-webpack-loader-syntax
  import demoSrc from '!raw-loader!../components/demo-app.vue'

  const props = {}
  const computed = {
    script () {
      let match = demoSrc.match(/<script[^>]*>([\s\S]*)<\/script>/)
      console.log(match)
      if (match && match[1]) {
        return match[1]
      }
    },
    template () {
      let match = demoSrc.match(/<template[^>]*>([\s\S]*)<\/template>/)
      if (match && match[1]) {
        return match[1]
      }
    },
    style () {
      let match = demoSrc.match(/<style[^>]*>([\s\S]*)<\/style>/)
      if (match && match[1]) {
        return match[1]
      }
    },
  }

  export default {
    name: 'vld-demo-page',
    mixins: [page],
    props,
    computed,
  }
</script>
