<template lang="pug">
  div(:class="[$options.name]")
    vld-hero(':bold'='true' color='is-primary')
      h1.title VueLayers demo app
      h2.subtitle An example app built with VueLayers

    demo-app

    section.section.content
      h3 Demo sources

      b-message(type="is-success").
        Now you can try the demo app yourself! Just clone the
        #[a(href="https://github.com/ghettovoice/vuelayers-demo" target="_blank") vuelayers-demo] repository and deploy.
      vld-code(lang="bash").
        git clone https://github.com/ghettovoice/vuelayers-demo.git
        cd vuelayers-demo
        npm install
        npm start
      p.
        After #[b Webpack] completes his work, open your browser and point it to #[code http://localhost:8080].#[br]
        You should see the demo application like above.

      h4 main.js
      b-tabs
        b-tab-item(label="JS")
          vld-code(lang="js") {{ main.script }}

      h4 demo-app.vue
      b-tabs
        b-tab-item(label='HTML')
          vld-code(lang="html") {{ demo.template }}
        b-tab-item(label='JS')
          vld-code(lang="js") {{ demo.script }}
        b-tab-item(label='SASS')
          vld-code(lang="styl") {{ demo.style }}
</template>

<script>
  import { extractScript, extractTemplate, extractStyle } from '../utils'
  import DemoApp from '../../modules/vuelayers-demo/src/App.vue'
  /* eslint-disable import/no-webpack-loader-syntax */
  import demoSrc from '!raw-loader!../../modules/vuelayers-demo/src/App.vue'
  import mainScriptSrc from '!raw-loader!../../modules/vuelayers-demo/src/main'
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
      }
    },
  }

  export default {
    name: 'vld-demo-page',
    components: {
      DemoApp,
    },
    props,
    computed,
  }
</script>
