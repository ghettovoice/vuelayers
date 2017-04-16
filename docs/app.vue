<template>
  <div id="app">
    <vl-map>
      <vl-view :center="center" :zoom="zoom" :rotation="rotation" @change="updateMapView"/>
      <vl-geoloc @change="updateGeoloc"/>

      <!-- interactions -->
      <vl-interaction-select ref="select" :selected="selected" @select="select" @unselect="unselect"
                             :filter="selectFilter">
        <vl-style-func :factory="selectStyleFunc">
          <!-- fallback style -->
          <vl-style-container>
            <vl-style-stroke color="#f03b20" :width="3"/>
            <vl-style-fill :color="[254, 178, 76, 0.7]"/>
          </vl-style-container>
          <!--// fallback style -->
        </vl-style-func>
      </vl-interaction-select>
      <!--// interactions -->

      <!-- base layers -->
      <vl-layer-tile id="osm" :visible="layers.osm">
        <vl-source-osm/>
      </vl-layer-tile>
      <!--// base layers -->

      <!-- Tile WMS -->
      <vl-layer-tile id="wms" :visible="layers.wms">
        <vl-source-wms url="https://ahocevar.com/geoserver/wms" layers="topp:states"
                       :ext-params="{ TILED: true }" server-type="geoserver" />
      </vl-layer-tile>
      <!--// Tile WMS -->

      <!-- WMTS -->
      <vl-layer-tile id="wmts" :visible="layers.wmts">
        <vl-source-wmts
          url="https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/"
          layer-name="0" matrix-set="EPSG:3857" format="image/png" style-name="default"/>
      </vl-layer-tile>
      <!--// WMTS -->

      <!-- countries vector -->
      <vl-layer-vector id="countries" v-if="countries.length" :visible="layers.countries">
        <!-- layer level style defined as style function for complex styling  -->
        <vl-style-func :factory="countriesStyleFunc">
          <!-- fallback styles -->
          <vl-style-container>
            <vl-style-stroke color="#8856a7" :width="2"/>
            <vl-style-fill :color="[158, 188, 218, 0.5]"/>
          </vl-style-container>
          <!--// fallback styles -->
        </vl-style-func>
        <!--// layer level style -->

        <!-- pass features as array for the huge or server loading datasets -->
        <vl-source-vector :features="countries"/>
      </vl-layer-vector>
      <!--// countries vector -->

      <!-- pacman, use vl-style-func for advanced styling -->
      <vl-layer-vector id="pacman" v-if="pacman.length" :visible="layers.pacman">
        <vl-style-func :factory="pacmanStyleFunc"/>

        <vl-source-vector>
          <vl-feature v-for="feature in pacman" :key="feature.id" :id="feature.id" :data="feature.properties">
            <component :is="geometryTypeToCompName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
      <!--// pacman -->

      <!-- current position overlay -->
      <vl-layer-vector v-if="position.length" id="position-layer" :z-index="100" :overlay="true">
        <vl-style-container>
          <vl-style-icon src="static/img/marker.png" :scale="0.3" :anchor="[0.5, 1]"/>
        </vl-style-container>

        <vl-source-vector>
          <vl-feature id="my-position" :z-index="999">
            <vl-geom-point :coordinates="position"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
      <!--// current position overlay -->
    </vl-map>

    <div class="controls">
      <button v-for="layer in [ 'osm', 'countries', 'pacman', 'wms', 'wmts' ]" :key="layer"
              @click="toggleLayer(layer)">
        Toggle layer {{ layer }}
      </button>

      <button @click="showSourceCode">Show usage info / example source code</button>

      <hr />
      Center: {{ center.map(x => parseFloat(x.toPrecision(6))) }} Zoom: {{ zoom }} Rotation {{ rotation }}<br />
      My position: {{ position.map(x => parseFloat(x.toPrecision(6))) }}<br />
      Current selection: {{ selectedIds }}
    </div>

    <transition name="slide">
      <div id="source-code" ref="sourceCode" v-if="sourceCode">
        <div class="controls">
          <button @click="sourceCode = false">Close</button>
        </div>

        <div id="install" v-html="installHTML"></div>

        <div id="src" v-html="demoSrcHTML"></div>

        <div class="controls">
          <button @click="sourceCode = false">Close</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import 'whatwg-fetch'
  import { kebabCase, forEach, get, set } from 'lodash/fp'
  import highlight from 'highlight.js'
  import highlightSCSS from 'highlight.js/lib/languages/scss'
  import highlightXML from 'highlight.js/lib/languages/xml'
  import highlightJavascript from 'highlight.js/lib/languages/javascript'
  import highlightBash from 'highlight.js/lib/languages/bash'
  import highlightJson from 'highlight.js/lib/languages/json'

  highlight.registerLanguage('scss', highlightSCSS)
  highlight.registerLanguage('xml', highlightXML)
  highlight.registerLanguage('javascript', highlightJavascript)
  highlight.registerLanguage('json', highlightJson)
  highlight.registerLanguage('bash', highlightBash)

  const computed = {
    selectedIds () {
      return this.selected.map(({ id }) => id)
    },
    installHTML () {
      return require('./install.html')
    },
    demoSrcHTML () {
      return require('./demo-src.html')
    }
  }

  const methods = {
    geometryTypeToCompName (type) {
      return 'vl-geom-' + kebabCase(type)
    },
    updateMapView ({ center, zoom, rotation }) {
      this.center = center
      this.zoom = zoom
      this.rotation = rotation
    },
    updateGeoloc ({ position }) {
      this.position = position
    },
    select (plainFeature) {
      const i = this.selectedIds.indexOf(plainFeature.id)
      if (i === -1) {
        this.selected.push(plainFeature)
      }
    },
    unselect ({ id }) {
      const i = this.selectedIds.indexOf(id)
      if (i !== -1) {
        this.selected.splice(i, 1)
      }
    },
    async loadData () {
      const res = await fetch('https://openlayers.org/en/latest/examples/data/geojson/countries.geojson')
      const geomCollection = await res.json()
      this.countries = geomCollection.features.map((feature, i) => {
        feature.properties = {
          ...feature.properties,
          color: i % 2 === 0 ? [ 49, 163, 84, 0.35 ] : [ 166, 100, 255, 0.35 ],
          selectColor: (i + 1) % 2 !== 0 ? [ 221, 28, 119, 0.5 ] : undefined
        }

        return feature
      })

      return this.countries
    },
    selectStyleFunc (s) {
      // first argument is an style helper. See https://github.com/ghettovoice/vuelayers/blob/master/src/ol-ext/style.js
      const styleName = 'select'
      const styleByFeature = {}
      const stroke = s.stroke({
        strokeColor: '#8856a7',
        strokeWidth: 4
      })

      return function __selectStyleFunc ({ id, properties }) {
        if (properties.selectColor) {
          let styles = get([ id, styleName ], styleByFeature)
          if (!styles) {
            styles = [
              s.style({
                stroke,
                fillColor: properties.selectColor
              })
            ]

            set([ id, styleName ], styles, styleByFeature)
          }

          return styles
        }
      }
    },
    countriesStyleFunc (s) {
      // first argument is an style helper. See https://github.com/ghettovoice/vuelayers/blob/master/src/ol-ext/style.js
      const stroke = s.stroke({
        strokeColor: '#8856a7',
        strokeWidth: 1
      })
      const styleName = 'default'
      const styleByFeature = {}

      return function __countriesStyleFunc ({ id, properties }) {
        let styles = get([ id, styleName ], styleByFeature)
        if (!styles) {
          styles = [
            s.style({
              stroke,
              fillColor: properties.color
            })
          ]

          set([ id, styleName ], styles, styleByFeature)
        }

        return styles
      }
    },
    pacmanStyleFunc (s) {
      // first argument is an style helper. See https://github.com/ghettovoice/vuelayers/blob/master/src/ol-ext/style.js
      const pacman = [
        s.style({
          strokeColor: '#DE9147',
          strokeWidth: 3,
          fillColor: [ 222, 189, 36, 0.8 ]
        })
      ]
      const path = [
        s.style({
          strokeColor: 'blue',
          strokeWidth: 1
        }),
        s.style({
          imageRadius: 5,
          imageFillColor: 'orange',
          geom ({ geometry }) {
            // geometry is an LineString, convert it to MultiPoint to style vertex
            // use turf.js for complex work with geometries
            return {
              ...geometry,
              type: 'MultiPoint'
            }
          }
        })
      ]
      const eye = [
        s.style({
          imageRadius: 6,
          imageFillColor: '#444444'
        })
      ]

      return function __pacmanStyleFunc (feature) {
        switch (feature.id) {
          case 'pacman':
            return pacman
          case 'pacman-path':
            return path
          case 'pacman-eye':
            return eye
        }
      }
    },
    toggleLayer (layer) {
      this.layers[ layer ] = !this.layers[ layer ]
    },
    selectFilter (feature, layer) {
      return layer && layer.id && [ 'position-layer', 'pacman' ].indexOf(layer.id) === -1
    },
    showSourceCode () {
      this.sourceCode = true
    }
  }

  const watch = {
    sourceCode (value) {
      if (value) {
        this.$nextTick(() => {
          forEach(::highlight.highlightBlock, this.$refs.sourceCode.querySelectorAll('pre > code'))
        })
      }
    },
    'layers.ani' (value) {
      if (value) {
        this.startAnimation()
      } else {
        this.stopAnimation()
      }
    }
  }

  export default {
    name: 'app',
    computed,
    watch,
    methods,
    data () {
      return {
        zoom: 2,
        center: [ 0, 0 ],
        rotation: 0,
        selected: [],
        countries: [],
        pacman: require('./static/pacman.geojson').features,
        position: [],
        layers: {
          osm: true,
          countries: true,
          pacman: false,
          wms: false,
          wmts: false
        },
        sourceCode: false
      }
    },
    created () {
      this.loadData()
        .catch(::console.error)
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "~highlight.js/styles/androidstudio.css";

  html, body, #app {
    width       : 100%;
    height      : 100%;
    margin      : 0;
    box-sizing  : border-box;
    font-family : Helvetica, Arial, sans-serif;
    overflow    : hidden;

    * {
      box-sizing : border-box;
    }
  }

  .controls {
    position   : absolute;
    bottom     : 10px;
    left       : 50%;
    transform  : translateX(-50%);
    width      : 70vw;
    background : rgba(255, 255, 255, 0.7);
    box-shadow : 0 0 20px rgba(2, 2, 2, 0.1);
    padding    : 5px;
    text-align : center;

    > button {
      margin         : 5px;
      padding        : 5px 10px;
      text-transform : uppercase;
    }
  }

  #source-code {
    overflow   : auto;
    position   : absolute;
    top        : 0;
    left       : 0;
    width      : 100%;
    height     : 100%;
    padding    : 20px;
    background : #ffffff;

    .controls {
      position   : relative;
      box-shadow : none;
    }
  }

  .slide-enter, .slide-leave-to {
    transform : translateY(100%);
  }

  .slide-enter-active, .slide-leave-active {
    transition : all .3s ease-out;
  }
</style>
