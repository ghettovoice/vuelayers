<template lang="pug">
  div.start
    vld-hero(:bold="bold", :color="color")
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    section.section.content
      b-message(type="is-warning")
        h3 Requirements
        ul
          li #[a(href="https://vuejs.org/", title="Vue Homepage", target="_blank") Vue] version #[b ^2.3]
          li #[a(href="https://openlayers.org/", title="OpenLayers Homepage", target="_blank") OpenLayers] version #[b ^3.14]

      h3 Installation
      h4 NPM
      p Install latest version of #[b Vue] and #[b C_PKG_FULLNAME] #[i (recommended)]:
      vld-code(lang="bash")
        | npm install --save vue C_PKG_NAME

      h4 CDN
      p Include C_PKG_FULLNAME files from #[b unpkg.com]:
      ul
        li #[b JavaScript] #[a(href="https://unpkg.com/C_PKG_NAME", target="blank") https://unpkg.com/C_PKG_NAME]
        li #[b CSS] #[a(href="https://unpkg.com/C_PKG_NAME/lib/style.css", target="blank") https://unpkg.com/C_PKG_NAME/lib/style.css]
      b-message(type="is-info")
        p.
          Don't forget to include #[b Vue] and #[b OpenLayers] JS files before #[b C_PKG_FULLNAME] initialization.#[br]

      h4 Build from source
      b-message(type="is-warning")
        p Node #[b v6+] is required.
      p Clone #[b C_PKG_FULLNAME] repository from #[a(href="C_PKG_REPOSITORY", target="_blank") GitHub] and deploy:
      vld-code(lang="bash").
        git clone --recursive -j8 C_PKG_REPOSITORY.git
        cd C_PKG_NAME
        npm install
        # build all targets
        npm run build
        # or only what you need, --bundles argument accepts list of targets
        # separated by comma (es, cjs, umd, umd-min)
        npm run rollup -- --bundles es,cjs
        # check lib dir, there are all ready to use components
        ls -l lib

      h3 NPM package description
      p.
        #[b C_PKG_FULLNAME] distributes as a set of standalone builds as well as set of separate components packages
        compiled into different module system types (#[b ES], #[b CommonJS], #[b AMD], #[b IIFE]). All distributed files
        can be found at the #[a(href="https://unpkg.com/C_PKG_NAME/lib/", target="_blank") #[code lib] directory] of the #[b NPM] package.
      p.
        Each directory includes a set of index files: #[code lib/**/index.js], #[code lib/**/index.es.js],
        #[code lib/**/index.umd.js] and #[code lib/**/index.umd.min.js]. All stylesheets are compiled to files:
        #[code lib/style.css] and #[code lib/style.min.css].
      table
        tr
          th Module system
          th Environments
          th JS
          th CSS
        tr
          td ES modules
          td Webpack 2, Rollup
          td #[code lib/index.es.js], #[code lib/**/index.es.js]
          td #[code lib/style.css]
        tr
          td CommonJS
          td Webpack 1, NodeJS
          td #[code lib/index.js], #[code lib/**/index.js]
          td #[code lib/style.css]
        tr
          td UMD
          td Browser, RequireJS
          td.
            #[code lib/index.umd.js], #[code lib/**/index.umd.js],#[br]
            #[code lib/index.umd.min.js], #[code lib/**/index.umd.min.js]
          td #[code lib/style.css]

      h3 Usage
      h4 NPM / Webpack / Rollup
      p Add to #[b app entry] file #[b C_PKG_FULLNAME] initialization:
      vld-code(lang="js").
        // main.js
        import Vue from 'vue'
        import C_PKG_FULLNAME from 'C_PKG_NAME'
        // import C_PKG_FULLNAME styles, needs css-loader
        import 'C_PKG_NAME/lib/style.css'
        // register all vl-* components
        Vue.use(C_PKG_FULLNAME)
        // now you are ready to go further
        // ...

      h4 Browser
      p(v-html="browserUsageExample")/

      h4 Individual components
      p.
        With #[b Webpack 2] / #[b Rollup] bundler (supports #[b ES module system] and #[b tree-shaking]) you can simply import
        directly that components:
      vld-code(lang="js").
        import Vue from 'vue'
        import { Map, TileLayer, OsmSource } from 'C_PKG_NAME'
        // import C_PKG_FULLNAME styles, needs css-loader
        import 'C_PKG_NAME/lib/style.css'

        Vue.use(Map)
        Vue.use(TileLayer)
        Vue.use(OsmSource)
      p.
        For pure #[b NodeJS] environment or bundlers that doesn't support #[b ES modules] (like #[b Webpack 1], #[b Browserify])
        you can import them manually:
      vld-code(lang="js").
        const Vue = require('Vue')
        const Map = require('C_PKG_NAME/lib/map')
        const TileLayer = require('C_PKG_NAME/lib/tile-layer')
        const OsmSource = require('C_PKG_NAME/lib/osm-source')
        // import C_PKG_FULLNAME styles, needs css-loader
        require('C_PKG_NAME/lib/style.css')

        Vue.use(Map)
        Vue.use(TileLayer)
        Vue.use(OsmSource)
      p.
        With tools like #[a(href="https://github.com/ant-design/babel-plugin-import", target="_blank") babel-plugin-import] or
        #[a(href="https://github.com/QingWei-Li/babel-plugin-component", target="_blank") babel-plugin-component] you can
        setup #[a auto import] of JS files. Example #[code .babelrc] config:
      vld-code(lang="json").
        {
          "presets": [
            ["env", "stage-2"]
          ],
          "plugins": [
            ["component", {
              "libraryName": "C_PKG_NAME"
            }]
          ]
        }
</template>

<script>
  import { constant } from 'lodash/fp'
  import page from '../page'
  import browserUsage from './browser-usage.md'

  const props = {
  }

  const computed = {
    browserUsageExample: constant(browserUsage),
  }

  export default {
    name: 'vld-start-page',
    mixins: [page],
    props,
    computed,
    mounted () {
      console.log(this.browserUsageExample)
    },
  }
</script>

<style></style>
