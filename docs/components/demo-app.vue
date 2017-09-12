<template>
  <div class="demo-app">
    <!-- app map -->
    <vl-map class="map" ref="map" :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
            @click="clickCoordinate = $event.coordinate" @postcompose="onMapPostCompose">
      <!-- map view aka ol.View -->
      <vl-view ref="view" :center="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

      <!-- interactions -->
      <vl-interaction-select :selected.sync="selectedFeatures">
        <vl-style-box>
          <vl-style-stroke color="#423e9e" :width="7"/>
          <vl-style-fill :color="[254, 178, 76, 0.7]"/>
          <vl-style-circle :radius="5">
            <vl-style-stroke color="#423e9e" :width="7"/>
            <vl-style-fill :color="[254, 178, 76, 0.7]"/>
          </vl-style-circle>
        </vl-style-box>
        <vl-style-box :z-index="1">
          <vl-style-stroke color="#d43f45" :width="2"/>
          <vl-style-circle :radius="5">
            <vl-style-stroke color="#d43f45" :width="2"/>
          </vl-style-circle>
        </vl-style-box>
      </vl-interaction-select>
      <!--// interactions -->

      <!-- geolocation -->
      <vl-geoloc @update:position="onUpdatePosition">
        <template scope="geoloc">
          <vl-feature v-if="geoloc.position" id="position-feature">
            <vl-geom-point :coordinates="geoloc.position"/>
            <vl-style-box>
              <vl-style-icon src="../static/img/marker.png" :scale="0.4" :anchor="[0.5, 1]"/>
            </vl-style-box>
          </vl-feature>
        </template>
      </vl-geoloc>
      <!--// geolocation -->

      <!-- overlay marker with animation -->
      <vl-feature id="marker" ref="marker" :properties="{ start: Date.now(), duration: 2500 }">
        <template scope="feature">
          <vl-geom-point :coordinates="[-10, -10]"/>
          <vl-style-box>
            <vl-style-icon src="../static/img/flag.png" :scale="0.5" :anchor="[0.1, 0.95]" :size="[128, 128]"/>
          </vl-style-box>
          <!-- overlay binded to feature -->
          <vl-overlay v-if="feature.geometry" :position="pointOnSurface(feature.geometry)" :offset="[10, 10]">
            <p class="is-light box content">
              Always opened overlay for Feature ID <strong>{{ feature.id }}</strong>
            </p>
          </vl-overlay>
        </template>
      </vl-feature>
      <!--// overlay marker -->

      <!-- base layer -->
      <vl-layer-tile id="sputnik">
        <vl-source-sputnik/>
      </vl-layer-tile>

      <!-- other layers from config -->
      <component v-for="layer in layers" :is="layer.cmp" :key="layer.id" v-bind="layer">
        <!-- add vl-source-* -->
        <component :is="layer.source.cmp" v-bind="layer.source">
          <!-- add static features to vl-source-vector if provided -->
          <vl-feature v-if="layer.source.staticFeatures && layer.source.staticFeatures.length"
                      v-for="feature in layer.source.staticFeatures" :key="feature.id"
                      :id="feature.id" :properties="feature.properties">
            <component :is="geometryTypeToCmpName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
          </vl-feature>

          <!-- add inner source if provided (like vl-source-vector inside vl-source-cluster) -->
          <component v-if="layer.source.source" :is="layer.source.source.cmp" v-bind="layer.source.source">
            <!-- add static features to vl-source-vector if provided -->
            <vl-feature v-if="layer.source.source.staticFeatures && layer.source.source.staticFeatures.length"
                        v-for="feature in layer.source.source.staticFeatures" :key="feature.id"
                        :id="feature.id" :properties="feature.properties">
              <component :is="geometryTypeToCmpName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
            </vl-feature>
          </component>
        </component>
        <!--// vl-source-* -->

        <!-- add style components if provided -->
        <!-- create vl-style-box or vl-style-func -->
        <component v-if="layer.style" v-for="(style, i) in layer.style" :key="i" :is="style.cmp" v-bind="style">
          <!-- create inner style components: vl-style-circle, vl-style-icon, vl-style-fill, vl-style-stroke & etc -->
          <component v-if="style.styles" v-for="(st, cmp) in style.styles" :key="cmp" :is="cmp" v-bind="st">
            <!-- vl-style-fill, vl-style-stroke if provided -->
            <vl-style-fill v-if="st.fill" v-bind="st.fill"/>
            <vl-style-fill v-if="st.stroke" v-bind="st.stroke"/>
          </component>
        </component>
        <!--// style -->
      </component>
      <!--// other layers -->

      <!-- selected feature popup -->
      <vl-overlay class="feature-popup" v-for="feature in selectedFeatures" :key="feature.id" :id="feature.id"
                  :position="pointOnSurface(feature.geometry)" :auto-pan="true" :stop-event="false">
        <template scope="popup">
          <vld-card>
            <p slot="header" class="card-header-title">
              Feature ID {{ feature.id }}
            </p>
            <a slot="header" class="card-header-icon" title="Close"
               @click="selectedFeatures = selectedFeatures.filter(f => f.id !== feature.id)">
              <b-icon icon="close"/>
            </a>

            <div class="content">
              <p>
                Overlay popup content for Feature with ID <strong>{{ feature.id }}</strong>
              </p>
              <p>
                Popup: {{ JSON.stringify(popup) }}
              </p>
              <p>
                Feature: {{ JSON.stringify({ id: feature.id, properties: feature.properties }) }}
              </p>
            </div>
          </vld-card>
        </template>
      </vl-overlay>
      <!--// selected popup -->
    </vl-map>
    <!--// app map -->

    <!-- map panel, controls -->
    <div class="map-panel">
      <b-panel :has-custom-template="true" :collapsible="true">
        <strong slot="header">Map panel</strong>
        <p class="panel-tabs">
          <a @click="onMapPanelTabClick('state')" :class="mapPanelTabClasses('state')">State</a>
          <a @click="onMapPanelTabClick('layers')" :class="mapPanelTabClasses('layers')">Layers</a>
        </p>

        <div class="panel-block" v-show="mapPanel.tab === 'state'">
          <table class="table is-fullwidth">
            <tr>
              <th>Map center</th>
              <td>{{ center }}</td>
            </tr>
            <tr>
              <th>Map zoom</th>
              <td>{{ zoom }}</td>
            </tr>
            <tr>
              <th>Map rotation</th>
              <td>{{ rotation }}</td>
            </tr>
            <tr>
              <th>Device coordinate</th>
              <td>{{ deviceCoordinate }}</td>
            </tr>
            <tr>
              <th>Selected features</th>
              <td>{{ selectedFeatures.map(f => f.id) }}</td>
            </tr>
          </table>
        </div>

        <div class="panel-block" v-for="layer in layers" :key="layer.id" @click="onMapPanelLayerClick"
             :class="{ 'is-active': layer.visible }"
             v-show="mapPanel.tab === 'layers'">
          <b-switch :key="layer.id" v-model="layer.visible">
            {{ layer.title }}
          </b-switch>
        </div>
      </b-panel>
    </div>
    <!--// map panel, controls -->
  </div>
</template>

<script>
  import { kebabCase, range, random } from 'lodash/fp'
  import { ol as vlol } from 'vuelayers'
  import pacmanFeaturesCollection from '../static/sample-data/pacman.geojson'

  const methods = {
    pointOnSurface: vlol.geom.pointOnSurface,
    geometryTypeToCmpName (type) {
      return 'vl-geom-' + kebabCase(type)
    },
    pacmanStyleFunc () {
      const pacman = [
        vlol.style.style({
          strokeColor: '#de9147',
          strokeWidth: 3,
          fillColor: [222, 189, 36, 0.8],
        }),
      ]
      const path = [
        vlol.style.style({
          strokeColor: 'blue',
          strokeWidth: 1,
        }),
        vlol.style.style({
          imageRadius: 5,
          imageFillColor: 'orange',
          geom (feature) {
            // geometry is an LineString, convert it to MultiPoint to style vertex
            return vlol.geom.multiPoint(feature.getGeometry().getCoordinates())
          },
        }),
      ]
      const eye = [
        vlol.style.style({
          imageRadius: 6,
          imageFillColor: '#444444',
        }),
      ]

      return function __pacmanStyleFunc (feature) {
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
    clusterStyleFunc () {
      const cache = {}

      return function __clusterStyleFunc (feature) {
        const size = feature.get('features').length
        let style = cache[size]

        if (!style) {
          style = vlol.style.style({
            imageRadius: 10,
            strokeColor: '#fff',
            fillColor: '#3399cc',
            text: size.toString(),
            textFillColor: '#fff',
          })
          cache[size] = style
        }
        return [style]
      }
    },
    selectFilter (feature) {
      return ['position-feature'].indexOf(feature.getId()) === -1
    },
    onUpdatePosition (coordinate) {
      this.deviceCoordinate = coordinate
    },
    onMapPostCompose ({ vectorContext, frameState }) {
      if (!this.$refs.marker || !this.$refs.marker.$feature) return

      const feature = this.$refs.marker.$feature
      if (!feature.getGeometry() || !feature.getStyle()) return

      const flashGeom = feature.getGeometry().clone()
      const duration = feature.get('duration')
      const elapsed = frameState.time - feature.get('start')
      const elapsedRatio = elapsed / duration
      const radius = vlol.easing.easeOut(elapsedRatio) * 35 + 5
      const opacity = vlol.easing.easeOut(1 - elapsedRatio)
      const fillOpacity = vlol.easing.easeOut(0.5 - elapsedRatio)

      vectorContext.setStyle(vlol.style.style({
        imageRadius: radius,
        fillColor: [119, 170, 203, fillOpacity],
        strokeColor: [119, 170, 203, opacity],
        strokeWidth: 2 + opacity,
      }))

      vectorContext.drawGeometry(flashGeom)
      vectorContext.setStyle(feature.getStyle()(feature)[0])
      vectorContext.drawGeometry(feature.getGeometry())

      if (elapsed > duration) {
        feature.set('start', Date.now())
      }

      this.$refs.map.render()
    },
    // map panel
    mapPanelTabClasses (tab) {
      return {
        'is-active': this.mapPanel.tab === tab,
      }
    },
    onMapPanelLayerClick (layer) {
      layer.visible = !layer.visible
    },
    onMapPanelTabClick (tab) {
      this.mapPanel.tab = tab
    },
  }

  export default {
    name: 'vld-demo-app',
    methods,
    data () {
      return {
        center: [0, 0],
        zoom: 2,
        rotation: 0,
        clickCoordinate: undefined,
        selectedFeatures: [],
        deviceCoordinate: undefined,
        mapPanel: {
          tab: 'state',
        },
        layers: [
          {
            id: 'pacman',
            title: 'Pacman',
            cmp: 'vl-layer-vector',
            visible: false,
            source: {
              cmp: 'vl-source-vector',
              staticFeatures: pacmanFeaturesCollection.features,
            },
            style: [
              {
                cmp: 'vl-style-func',
                factory: this.pacmanStyleFunc,
              },
            ],
          },
          {
            id: 'countries',
            title: 'Countries',
            cmp: 'vl-layer-vector',
            visible: false,
            source: {
              cmp: 'vl-source-vector',
              url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
            },
            style: [
              {
                cmp: 'vl-style-box',
                styles: {
                  'vl-style-fill': {
                    color: [255, 255, 255, 0.5],
                  },
                  'vl-style-stroke': {
                    color: '#219e46',
                    width: 2,
                  },
                },
              },
            ],
          },
          {
            id: 'wms',
            title: 'WMS',
            cmp: 'vl-layer-tile',
            visible: false,
            source: {
              cmp: 'vl-source-wms',
              url: 'https://ahocevar.com/geoserver/wms',
              layers: 'topp:states',
              extParams: { TILED: true },
              serverType: 'geoserver',
            },
          },
          {
            id: 'wmts',
            title: 'WMTS',
            cmp: 'vl-layer-tile',
            visible: false,
            source: {
              cmp: 'vl-source-wmts',
              url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/',
              layerName: '0',
              matrixSet: 'EPSG:3857',
              format: 'image/png',
              styleName: 'default',
            },
          },
          {
            id: 'cluster',
            title: 'Cluster',
            cmp: 'vl-layer-vector',
            visible: false,
            source: {
              cmp: 'vl-source-cluster',
              distance: 40,
              source: {
                cmp: 'vl-source-vector',
                features: range(0, 20000).map(i => {
                  let coordinate = [random(-50, 50), random(-50, 50)]

                  return {
                    type: 'Feature',
                    id: 'random-' + i,
                    geometry: {
                      type: 'Point',
                      coordinates: coordinate,
                    },
                  }
                }),
              },
            },
            style: [
              {
                cmp: 'vl-style-func',
                factory: this.clusterStyleFunc,
              },
            ],
          },
        ],
      }
    },
  }
</script>

<style lang="sass">
  @import ../styles/variables

  .demo-app
    position: relative
    .map
      height: 500px
    .map-panel
      padding: 0
      .panel-heading
        box-shadow: 0 .25em .5em transparentize($dark, 0.8)
      .panel-content
        background: $white
        box-shadow: 0 .25em .5em transparentize($dark, 0.8)
      +widescreen()
        position: absolute
        top: 0
        right: 0
        max-height: 500px
        width: 20em
    .feature-popup
      position: absolute
      left: -50px
      bottom: 12px
      width: 20em
      max-width: none
      &:after, &:before
        top: 100%
        border: solid transparent
        content: ' '
        height: 0
        width: 0
        position: absolute
        pointer-events: none
      &:after
        border-top-color: white
        border-width: 10px
        left: 48px
        margin-left: -10px
      &:before
        border-top-color: #cccccc
        border-width: 11px
        left: 48px
        margin-left: -11px
      .content
        word-break: break-all
</style>
