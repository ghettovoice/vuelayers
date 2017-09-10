<template>
  <div class="demo-app">
    <vl-map ref="map" :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
      <!-- map view aka ol.View -->
      <vl-view ref="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

      <!-- interactions -->
      <vl-interaction-select :selected.sync="selected" :filter="selectFilter">
        <vl-style-box>
          <vl-style-stroke color="#423e9e" :width="7"/>
          <vl-style-fill :color="[254, 178, 76, 0.7]"/>
        </vl-style-box>
        <vl-style-box>
          <vl-style-stroke color="#d43f45" :width="2"/>
        </vl-style-box>
      </vl-interaction-select>

      <!-- ol.Geolocation -->
      <vl-geoloc @update:position="onUpdatePosition">
        <template scope="ctx">
          <vl-feature v-if="ctx.position" id="position-feature">
            <vl-geom-point :coordinates="ctx.position"/>
            <vl-style-box>
              <vl-style-icon src="../static/marker.png" :scale="0.4" :anchor="[0.5, 1]"/>
            </vl-style-box>
          </vl-feature>
        </template>
      </vl-geoloc>

      <!-- base layer -->
      <vl-layer-tile id="sputnik">
        <vl-source-sputnik/>
      </vl-layer-tile>

      <!-- other layers -->
      <component v-for="layer in layers" :is="layer.cmp" :key="layer.id" v-bind="layer">
        <!-- vl-source-* -->
        <component :is="layer.source.cmp" v-bind="layer.source">
          <!-- add static features to vl-source-vector if provided -->
          <vl-feature v-if="layer.source.staticFeatures && layer.source.staticFeatures.length"
                      v-for="feature in layer.source.staticFeatures" :key="feature.id"
                      :id="feature.id" :properties="feature.properties">
            <component :is="geometryTypeToCmpName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
          </vl-feature>
        </component>

        <!-- add style components if provided -->
        <!-- create vl-style-box or vl-style-func -->
        <component v-if="layer.style" v-for="(style, i) in layer.style" :key="i" :is="style.cmp" v-bind="style">
          <!-- if vl-style-box used, create vl-style-circle, vl-style-icon, vl-style-fill, vl-style-stroke & etc -->
          <component v-if="style.styles" v-for="(st, cmp) in style.styles" :key="cmp" :is="cmp" v-bind="st">
            <!-- vl-style-fill, vl-style-stroke if provided -->
            <vl-style-fill v-if="st.fill" v-bind="st.fill"/>
            <vl-style-fill v-if="st.stroke" v-bind="st.stroke"/>
          </component>
        </component>
      </component>
    </vl-map>
  </div>
</template>

<script>
  import { kebabCase } from 'lodash/fp'
  import { ol as vlol } from 'vuelayers'
  import pacmanFeaturesCollection from '../static/pacman.geojson'

  const methods = {
    geometryTypeToCmpName (type) {
      return 'vl-geom-' + kebabCase(type)
    },
    pacmanStyleFunc () {
      // first argument is an style helper. See https://github.com/ghettovoice/vuelayers/blob/master/src/ol-ext/style.js
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
    selectFilter (feature) {
      return [ 'position-feature' ].indexOf(feature.getId()) === -1
    },
    onUpdatePosition (coordinate) {
      console.log('current position', coordinate)
    },
  }

  export default {
    name: 'vld-demo-app',
    methods,
    data () {
      return {
        center: [0, 0],
        zoom: 1,
        rotation: 0,
        selected: [],
        layers: [
          {
            id: 'pacman',
            title: 'Pacman',
            cmp: 'vl-layer-vector',
            visible: true,
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
            visible: true,
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
            visible: true,
            source: {
              cmp: 'vl-source-wmts',
              url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/',
              layerName: '0',
              matrixSet: 'EPSG:3857',
              format: 'image/png',
              styleName: 'default',
            },
          },
        ],
      }
    },
  }
</script>

<style>
</style>
