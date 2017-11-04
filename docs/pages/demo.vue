<template lang="pug">
  div(:class="[$options.name]")
    vld-hero(':bold'='true' color='is-primary')
      h1.title VueLayers demo app
      h2.subtitle An example app built with VueLayers

    demo-app

    section.section.content
      h3 Demo sources

      h4 main.js
      b-tabs
        b-tab-item(label="JS")
          vld-code(lang="js") {{ main.script }}
        b-tab-item(label="SASS")
          vld-code(lang="styl") {{ main.style }}

      h4 demo-app.vue
      b-tabs
        b-tab-item(label='JS')
          vld-code(lang="js") {{ demo.script }}
        b-tab-item(label='HTML')
          vld-code(lang="html") {{ demo.template }}
        b-tab-item(label='SASS')
          vld-code(lang="styl") {{ demo.style }}
</template>

<script>
  import { extractScript, extractTemplate, extractStyle } from '../utils'
  import DemoApp from '../../demo/app.vue'
  /* eslint-disable import/no-webpack-loader-syntax */
  import demoSrc from '!raw-loader!../../demo/app.vue'
  import mainScriptSrc from '!raw-loader!../../demo/main'
  import mainStyleSrc from '!raw-loader!../../demo/main.sass'
  import BTabs from '../../node_modules/buefy/src/components/tabs/Tabs.vue'
  /* eslint-enable import/no-webpack-loader-syntax */

  const props = {
  }

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
    components: {
      BTabs,
      DemoApp,
    },
    props,
    computed,
  }
</script>
