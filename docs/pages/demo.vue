<template lang="pug">
  div(:class="[$options.name]")
    vld-hero(:bold='bold', :color='color')
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    vld-demo-app

    section.section.content
      h3 Demo sources
      b main.js
      b-tabs
        b-tab-item(label='JS')
          vld-code(lang="js") {{ main.script }}
        b-tab-item(label='SASS')
          vld-code(lang="styl") {{ main.style }}
      b demo-app.vue
      b-tabs
        b-tab-item(label='JS')
          vld-code(lang="js") {{ demo.script }}
        b-tab-item(label='HTML')
          vld-code(lang="html") {{ demo.template }}
        b-tab-item(label='SASS')
          vld-code(lang="styl") {{ demo.style }}
</template>

<script>
  import page from './page'
  import { extractScript, extractTemplate, extractStyle } from '../utils'
  /* eslint-disable import/no-webpack-loader-syntax */
  import demoSrc from '!raw-loader!../components/demo-app.vue'
  import mainScriptSrc from '!raw-loader!../main'
  import mainStyleSrc from '!raw-loader!../styles/main.sass'
  /* eslint-enable import/no-webpack-loader-syntax */

  const props = {}
  const computed = {
    demo () {
      return {
        script: extractScript(demoSrc),
        template: extractTemplate(demoSrc),
        style: extractStyle(demoSrc),
      }
    },
    main () {
      return {
        script: mainScriptSrc,
        style: mainStyleSrc,
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
