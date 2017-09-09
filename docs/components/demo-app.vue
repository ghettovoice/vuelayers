<template>
  <div class="demo-app">
    <vl-map ref="map" :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
      <!-- map view aka ol.View -->
      <vl-view ref="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

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
          <component v-if="style.styles" v-for="(style, cmp) in style.styles" :key="cmp" :is="cmp" v-bind="style">
            <!-- vl-style-fill, vl-style-stroke if provided -->
            <vl-style-fill v-if="style.fill" v-bind="style.fill"/>
            <vl-style-fill v-if="style.stroke" v-bind="style.stroke"/>
          </component>
        </component>
      </component>
    </vl-map>
  </div>
</template>

<script>
  import { kebabCase } from 'lodash/fp'
  import { ol as vlol } from 'vuelayers'

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
        layers: [
          {
            id: 'pacman',
            cmp: 'vl-layer-vector',
            visible: true,
            source: {
              cmp: 'vl-source-vector',
              url: '../static/pacman.geojson',
            },
            style: [
              {
                cmp: 'vl-style-func',
                factory: this.pacmanStyleFunc,
              },
            ],
          },
        ],
      }
    },
  }
</script>

<style>
</style>
