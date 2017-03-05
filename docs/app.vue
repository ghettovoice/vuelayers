<template>
  <div id="app">
    <vl-map>
      <vl-map-view :center="center" :zoom="zoom" :rotation="rotation" @change="updateMapView"/>
      <vl-geoloc @change="updateGeoloc"/>

      <!-- interactions -->
      <vl-interaction-select ref="select" :selected="selected" @select="select" @unselect="unselect">
        <vl-style-container>
          <vl-style-stroke color="#f03b20" :width="3"/>
          <vl-style-fill :color="[254, 178, 76, 0.7]"/>
        </vl-style-container>
      </vl-interaction-select>
      <!--// interactions -->

      <!-- base layers -->
      <vl-layer-tile id="osm" :visible="layers.osm">
        <vl-source-osm/>
      </vl-layer-tile>

      <vl-layer-tile id="mapbox" :visible="layers.mapbox">
        <vl-source-mapbox map-id="ghettovoice.nbm2olb0"
                          access-token="pk.eyJ1IjoiZ2hldHRvdm9pY2UiLCJhIjoiMzMxYzMyMWQ3NTgzMTU4Nzk3ZTNmMmI3MmQ1NmVhMjgifQ._erAEzdvdB0jfYXXqzOJCg"/>
      </vl-layer-tile>
      <!--// base layers -->

      <!-- countries vector -->
      <vl-layer-vector id="countries" v-if="countries.length" :visible="layers.countries">
        <!-- layer level style -->
        <vl-style-container>
          <vl-style-stroke color="#8856a7" :width="2"/>
          <vl-style-fill :color="[158, 188, 218, 0.5]"/>
        </vl-style-container>
        <!--// layer level style -->

        <vl-source-vector>
          <vl-feature v-for="feature in countries" :key="feature.id" :id="feature.id" :data="feature.properties">
            <component :is="geometryTypeToCompName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>

            <!-- feature level style -->
            <vl-style-container v-if="feature.properties.color && !selected.includes(feature.id)">
              <vl-style-stroke color="#8856a7" :width="2"/>
              <vl-style-fill :color="feature.properties.color"/>
            </vl-style-container>

            <vl-style-container v-if="selected.includes(feature.id) && feature.properties.selectColor">
              <vl-style-stroke color="#8856a7" :width="2"/>
              <vl-style-fill :color="feature.properties.selectColor"/>
            </vl-style-container>
            <!-- feature level style -->
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
      <!--// countries vector -->

      <!-- pacman, use v-style-func for advanced styling -->
      <vl-layer-vector id="pacman" v-if="pacman.length" v-style-func="pacmanStyleFunc" :visible="layers.pacman">
        <vl-source-vector>
          <vl-feature v-for="feature in pacman" :key="feature.id" :id="feature.id" :data="feature.properties">
            <component :is="geometryTypeToCompName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
      <!--// pacman -->

      <!-- position -->
      <vl-layer-vector v-if="position.length" id="my-position" :z-index="100">
        <vl-style-container>
          <vl-style-icon src="static/img/marker.png" :scale="0.3" :anchor="[0.5, 1]"/>
        </vl-style-container>

        <vl-source-vector>
          <vl-feature id="my-position">
            <vl-geom-point :coordinates="position"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
      <!--// position -->
    </vl-map>

    <div class="controls">
      <button v-for="layer in ['osm', 'mapbox', 'countries', 'pacman']" :key="layer" @click="toggleLayer(layer)">
        Toggle layer {{ layer }}
      </button>

      <button @click="showSourceCode">Show source code</button>

      <hr />
      Center: {{ center.map(x => parseFloat(x.toPrecision(6))) }} Zoom: {{ zoom }} Rotation {{ rotation }}<br />
      My position: {{ position.map(x => parseFloat(x.toPrecision(6))) }}<br />
      Current selection: {{ selected }}
    </div>

    <transition name="slide">
      <div id="source-code" ref="sourceCode" v-if="sourceCode">
        <div class="controls">
          <button @click="sourceCode = false">Close</button>
        </div>
        <div>
          <h1>HTML</h1>
          <pre>
            <code class="xml">
&lt;vl-map&gt;
  &lt;vl-map-view :center=&quot;center&quot; :zoom=&quot;zoom&quot; :rotation=&quot;rotation&quot; @change=&quot;updateMapView&quot;/&gt;
  &lt;vl-geoloc @change=&quot;updateGeoloc&quot;/&gt;

  &lt;!-- interactions --&gt;
  &lt;vl-interaction-select ref=&quot;select&quot; :selected=&quot;selected&quot; @select=&quot;select&quot; @unselect=&quot;unselect&quot;&gt;
    &lt;vl-style-container&gt;
      &lt;vl-style-stroke color=&quot;#f03b20&quot; :width=&quot;3&quot;/&gt;
      &lt;vl-style-fill :color=&quot;[254, 178, 76, 0.7]&quot;/&gt;
    &lt;/vl-style-container&gt;
  &lt;/vl-interaction-select&gt;
  &lt;!-- interactions --&gt;

  &lt;!-- base layers --&gt;
  &lt;vl-layer-tile id=&quot;osm&quot; :visible=&quot;layers.osm&quot;&gt;
    &lt;vl-source-osm/&gt;
  &lt;/vl-layer-tile&gt;

  &lt;vl-layer-tile id=&quot;mapbox&quot; :visible=&quot;layers.mapbox&quot;&gt;
    &lt;vl-source-mapbox map-id=&quot;ghettovoice.nbm2olb0&quot;
                      access-token=&quot;pk.eyJ1IjoiZ2hldHRvdm9pY2UiLCJhIjoiMzMxYzMyMWQ3NTgzMTU4Nzk3ZTNmMmI3MmQ1NmVhMjgifQ._erAEzdvdB0jfYXXqzOJCg&quot;/&gt;
  &lt;/vl-layer-tile&gt;
  &lt;!-- base layers --&gt;

  &lt;!-- countries vector --&gt;
  &lt;vl-layer-vector id=&quot;countries&quot; v-if=&quot;countries.length&quot; :visible=&quot;layers.countries&quot;&gt;
    &lt;!-- layer level style --&gt;
    &lt;vl-style-container&gt;
      &lt;vl-style-stroke color=&quot;#8856a7&quot; :width=&quot;2&quot;/&gt;
      &lt;vl-style-fill :color=&quot;[158, 188, 218, 0.5]&quot;/&gt;
    &lt;/vl-style-container&gt;
    &lt;!-- layer level style --&gt;

    &lt;vl-source-vector&gt;
      &lt;vl-feature v-for=&quot;feature in countries&quot; :key=&quot;feature.id&quot; :id=&quot;feature.id&quot; :data=&quot;feature.properties&quot;&gt;
        &lt;component :is=&quot;geometryTypeToCompName(feature.geometry.type)&quot; :coordinates=&quot;feature.geometry.coordinates&quot;/&gt;

        &lt;!-- feature level style --&gt;
        &lt;vl-style-container v-if=&quot;feature.properties.color &amp;&amp; !selected.includes(feature.id)&quot;&gt;
          &lt;vl-style-stroke color=&quot;#8856a7&quot; :width=&quot;2&quot;/&gt;
          &lt;vl-style-fill :color=&quot;feature.properties.color&quot;/&gt;
        &lt;/vl-style-container&gt;

        &lt;vl-style-container v-if=&quot;selected.includes(feature.id) &amp;&amp; feature.properties.selectColor&quot;&gt;
          &lt;vl-style-stroke color=&quot;#8856a7&quot; :width=&quot;2&quot;/&gt;
          &lt;vl-style-fill :color=&quot;feature.properties.selectColor&quot;/&gt;
        &lt;/vl-style-container&gt;
        &lt;!-- feature level style --&gt;
      &lt;/vl-feature&gt;
    &lt;/vl-source-vector&gt;
  &lt;/vl-layer-vector&gt;
  &lt;!-- countries vector --&gt;

  &lt;!-- pacman, use v-style-func for advanced styling --&gt;
  &lt;vl-layer-vector id=&quot;pacman&quot; v-if=&quot;pacman.length&quot; v-style-func=&quot;pacmanStyleFunc&quot; :visible=&quot;layers.pacman&quot;&gt;
    &lt;vl-source-vector&gt;
      &lt;vl-feature v-for=&quot;feature in pacman&quot; :key=&quot;feature.id&quot; :id=&quot;feature.id&quot; :data=&quot;feature.properties&quot;&gt;
        &lt;component :is=&quot;geometryTypeToCompName(feature.geometry.type)&quot; :coordinates=&quot;feature.geometry.coordinates&quot;/&gt;
      &lt;/vl-feature&gt;
    &lt;/vl-source-vector&gt;
  &lt;/vl-layer-vector&gt;
  &lt;!-- pacman --&gt;

  &lt;!-- position --&gt;
  &lt;vl-layer-vector v-if=&quot;position.length&quot; id=&quot;my-position&quot; :z-index=&quot;100&quot;&gt;
    &lt;vl-style-container&gt;
      &lt;vl-style-icon src=&quot;/static/marker.png&quot; :scale=&quot;0.3&quot; :anchor=&quot;[0.5, 1]&quot;/&gt;
    &lt;/vl-style-container&gt;

    &lt;vl-source-vector&gt;
      &lt;vl-feature id=&quot;my-position&quot;&gt;
        &lt;vl-geom-point :coordinates=&quot;position&quot;/&gt;
      &lt;/vl-feature&gt;
    &lt;/vl-source-vector&gt;
  &lt;/vl-layer-vector&gt;
  &lt;!-- position --&gt;
&lt;/vl-map&gt;
            </code>
          </pre>
        </div>

        <div>
          <h1>JavaScript</h1>
          <pre>
            <code class="javascript">
import 'whatwg-fetch'
import { kebabCase } from 'lodash/fp'

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
  select (id) {
    if (this.selected.indexOf(id) === -1) {
      this.selected.push(id)
    }
  },
  unselect (id) {
    const i = this.selected.indexOf(id)
    if (i !== -1) {
      this.selected.splice(i, 1)
    }
  },
  async loadData () {
    const res = await fetch('https://openlayers.org/en/latest/examples/data/geojson/countries.geojson')
    const geomCollection = await res.json()
    this.countries = geomCollection.features.map((feature, i) =&gt; {
      feature.properties = {
        ...feature.properties,
        color: i % 2 === 0 ? [ 49, 163, 84, 0.7 ] : undefined,
        selectColor: i % 2 !== 0 ? [ 221, 28, 119, 0.9 ] : undefined
      }

      return feature
    })

    return this.countries
  },
  /**
   * Style function factory, use with v-style-func directive to apply complex stylings with OpenLayers native API.
   */
  pacmanStyleFunc (ol, styleHelper) {
    const pacman = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#DE9147',
          width: 3
        }),
        fill: new ol.style.Fill({
          color: [ 222, 189, 36, 0.8 ]
        })
      })
    ]
    const path = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          width: 1
        })
      }),
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: 'orange'
          })
        }),
        geometry (feature) {
          return new ol.geom.MultiPoint(feature.getGeometry().getCoordinates())
        }
      })
    ]
    const eye = [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: '#444444'
          })
        })
      })
    ]

    return function __pacmanStyleFunc (feature, resolution) {
      switch (feature.getId()) {
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
  }
}

export default {
  name: 'app',
  methods,
  data () {
    return {
      zoom: 2,
      center: [ 0, 0 ],
      rotation: 0,
      selected: [],
      countries: [],
      pacman: require('../static/pacman.geojson').features,
      position: [],
      layers: {
        osm: false,
        mapbox: true,
        countries: true,
        pacman: false
      }
    }
  },
  created () {
    this.loadData()
      .catch(::console.error)
  }
}
            </code>
          </pre>
        </div>
        <div class="controls">
          <button @click="sourceCode = false">Close</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import 'whatwg-fetch'
  import { kebabCase, forEach } from 'lodash/fp'
  import highlight from 'highlight.js'
  import highlightSCSS from 'highlight.js/lib/languages/scss'
  import highlightXML from 'highlight.js/lib/languages/xml'
  import highlightJavascript from 'highlight.js/lib/languages/javascript'

  highlight.registerLanguage('scss', highlightSCSS)
  highlight.registerLanguage('xml', highlightXML)
  highlight.registerLanguage('javascript', highlightJavascript)

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
    select (id) {
      if (this.selected.indexOf(id) === -1) {
        this.selected.push(id)
      }
    },
    unselect (id) {
      const i = this.selected.indexOf(id)
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
          color: i % 2 === 0 ? [ 49, 163, 84, 0.7 ] : undefined,
          selectColor: i % 2 !== 0 ? [ 221, 28, 119, 0.9 ] : undefined
        }

        return feature
      })

      return this.countries
    },
    pacmanStyleFunc (ol, styleHelper) {
      const pacman = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#DE9147',
            width: 3
          }),
          fill: new ol.style.Fill({
            color: [ 222, 189, 36, 0.8 ]
          })
        })
      ]
      const path = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'blue',
            width: 1
          })
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
              color: 'orange'
            })
          }),
          geometry (feature) {
            return new ol.geom.MultiPoint(feature.getGeometry().getCoordinates())
          }
        })
      ]
      const eye = [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
              color: '#444444'
            })
          })
        })
      ]

      return function __pacmanStyleFunc (feature, resolution) {
        switch (feature.getId()) {
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
    }
  }

  export default {
    name: 'app',
    watch,
    methods,
    data () {
      return {
        zoom: 2,
        center: [ 0, 0 ],
        rotation: 0,
        selected: [],
        countries: [],
        pacman: require('../static/pacman.geojson').features,
        position: [],
        layers: {
          osm: false,
          mapbox: true,
          countries: true,
          pacman: false
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
      position : relative;
    }
  }

  .slide-enter, .slide-leave-to {
    transform : translateY(100%);
  }

  .slide-enter-active, .slide-leave-active {
    transition : all .3s ease-out;
  }
</style>
