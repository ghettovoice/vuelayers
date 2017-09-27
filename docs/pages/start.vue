<template lang="pug">
  div(:class="[$options.name]")
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
      p Install latest version of #[b Vue] and #[b VueLayers] #[i (recommended)]:
      vld-code(lang="bash").
        npm install --save vue vuelayers

      h4 CDN
      p Include VueLayers files from #[b unpkg.com]:
      ul
        li #[b JavaScript] #[a(href="https://unpkg.com/vuelayers", target="blank") https://unpkg.com/vuelayers]
        li #[b CSS] #[a(href="https://unpkg.com/vuelayers/lib/style.css", target="blank") https://unpkg.com/vuelayers/lib/style.css]
      b-message(type="is-info")
        p.
          Don't forget to include #[b Vue] and #[b OpenLayers] JS files before #[b VueLayers] initialization.#[br]

      h4 Build from source
      b-message(type="is-warning")
        p Node #[b v6+] is required.
      p.
        Clone #[b VueLayers] repository from #[a(href="C_PKG_REPOSITORY", target="_blank") GitHub] and deploy:
      vld-code(lang="bash").
        git clone --recursive -j8 C_PKG_REPOSITORY.git
        cd vuelayers
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
        #[b VueLayers] distributes as a set of standalone builds as well as set of separate modules
        compiled for different module systems (#[b ES], #[b CommonJS], #[b AMD], #[b IIFE]). All distributed files
        can be found at the #[a(href="https://unpkg.com/vuelayers/lib/", target="_blank") #[code lib] directory]
        of the #[b NPM] package.
      p.
        Each directory includes a set of index files: #[code lib/**/index.js], #[code lib/**/index.es.js],
        #[code lib/**/index.umd.js] and #[code lib/**/index.umd.min.js]. All stylesheets are compiled to files:
        #[code lib/style.css] and #[code lib/style.min.css].
      table.is-hidden-touch
        tr
          th Module system
          th Environments
          th JS
          th CSS
        tr(v-for="row in builds")
          td {{ row.sys }}
          td {{ row.env.join(', ') }}
          td(v-html="row.js.map(f => `<code>${f}</code>`).join('<br />')")
          td(v-html="row.css.map(f => `<code>${f}</code>`).join('<br />')")
      ul.is-hidden-desktop
        li(v-for="row in builds").
           #[b Module system]: {{ row.sys }}#[br]
           #[b Environments]: {{ row.env.join(', ') }}#[br]
           #[b JS]: #[span(v-html="row.js.map(f => `<code>${f}</code>`).join(', ')")]#[br]
           #[b CSS]: #[span(v-html="row.css.map(f => `<code>${f}</code>`).join(', ')")]#[br]

      h3 Usage
      h4 NPM / Webpack / Rollup
      p Register #[b VueLayers] components in app entry script:
      vld-code(lang="js").
        // main.js
        import Vue from 'vue'
        import * as VueLayers from 'vuelayers'
        // import VueLayers styles, needs css-loader
        import 'vuelayers/lib/style.css'
        // register all vl-* components
        Vue.use(VueLayers)
        // now you are ready to go further
        // ...

        // OR
        const Vue = require('vue')
        const VueLayers = require('vuelayers')
        // import VueLayers styles, needs css-loader
        require('vuelayers/lib/style.css')
        // register all vl-* components
        Vue.use(VueLayers)
        // now you are ready to go further
        // ...

      h4 Browser
      vld-code(lang="html").
        &lt;!-- include Vue and OpenLayers --&gt;
        &lt;script src="https://unpkg.com/vue"&gt;&lt;/script&gt;
        &lt;script src="https://unpkg.com/openlayers"&gt;&lt;/script&gt;
        &lt;!-- include standalone VueLayers files --&gt;
        &lt;link rel="stylesheet" href="https://unpkg.com/vuelayers/lib/style.css"&gt;
        &lt;script src="https://unpkg.com/vuelayers"&gt;&lt;/script&gt;

        &lt;script&gt;
          // VueLayers exports itself to the global variable: window.VueLayers
          Vue.use(VueLayers)
          // now you are ready to go further
          // ...
        &lt;/script&gt;

      h4 Individual components
      p.
        With #[b Webpack 2] / #[b Rollup] bundler (supports #[b ES module system] and #[b tree-shaking]) just import
        what you need:
      vld-code(lang="js").
        import Vue from 'vue'
        import { Map, TileLayer, OsmSource } from 'vuelayers'
        // import VueLayers styles, needs css-loader
        import 'vuelayers/lib/style.css'

        // register vl-map, vl-view components
        Vue.use(Map)
        // register vl-layer-tile component
        Vue.use(TileLayer)
        // register vl-source-osm component
        Vue.use(OsmSource)
      p.
        In pure #[b NodeJS] environment or environments that doesn't support #[b ES modules] (like #[b Webpack 1], #[b Browserify])
        you can import #[b VueLayers] modules manually:
      vld-code(lang="js").
        const Vue = require('Vue')
        const Map = require('vuelayers/lib/map')
        const TileLayer = require('vuelayers/lib/tile-layer')
        const OsmSource = require('vuelayers/lib/osm-source')
        // import VueLayers styles, needs css-loader
        require('vuelayers/lib/style.css')

        // register vl-map, vl-view components
        Vue.use(Map)
        // register vl-layer-tile component
        Vue.use(TileLayer)
        // register vl-source-osm component
        Vue.use(OsmSource)
      p.
        Or use the tool like #[a(href="https://github.com/ant-design/babel-plugin-import", target="_blank") babel-plugin-import] /
        #[a(href="https://github.com/QingWei-Li/babel-plugin-component", target="_blank") babel-plugin-component] that can
        import JS files #[b modularly].
        #[br]
        Example of #[code .babelrc] config:
      vld-code(lang="json").
        {
          "presets": [
            ["env", "stage-2"]
          ],
          "plugins": [
            ["component", {
              "libraryName": "vuelayers"
            }]
          ]
        }
</template>

<script>
  import page from './page'

  const props = {
  }
  const computed = {
    builds () {
      return [
        {
          sys: 'ES modules',
          env: ['Webpack 2', 'Rollup'],
          js: ['lib/index.es.js', 'lib/**/index.es.js'],
          css: ['lib/style.css'],
        },
        {
          sys: 'CommonJS',
          env: ['Webpack 1', 'NodeJS'],
          js: ['lib/index.js', 'lib/**/index.js'],
          css: ['lib/style.css'],
        },
        {
          sys: 'UMD',
          env: ['Browser', 'AMD'],
          js: ['lib/index.umd[.min].js', 'lib/**/index.umd[.min].js'],
          css: ['lib/style.css'],
        },
      ]
    },
  }

  export default {
    name: 'vld-start-page',
    mixins: [page],
    props,
    computed,
  }
</script>
