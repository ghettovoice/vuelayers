<template>
  <div id="app">
    <div style="height: 100%">
      <div class="panel">
        <div>
          Selected: {{ selectedFeatureIds }}
        </div>
        <button @click="toggleMap">Toggle map</button>
        <button @click="resetDrawFeatures">Reset draw features</button>
      </div>

      <vl-map v-if="mapVisible" ref="map" data-projection="EPSG:4326">
        <vl-view :center.sync="center" :rotation.sync="rotation" :zoom.sync="zoom"
                 ident="view" ref="view" />

        <vl-geoloc>
          <template slot-scope="geoloc">
            <vl-feature v-if="geoloc.position" id="position-feature">
              <vl-geom-point :coordinates="geoloc.position" />
            </vl-feature>
          </template>
        </vl-geoloc>

        <vl-layer-tile>
          <vl-source-osm />
        </vl-layer-tile>

        <!--<vl-layer-vector id="countries" render-mode="image">-->
        <!--  <vl-source-vector ident="countries-source" :features.sync="countries" :url="countriesUrl" />-->
        <!--  <vl-style-func :factory="createCountriesStyleFunc" />-->
        <!--</vl-layer-vector>-->

        <!--<vl-layer-vector render-mode="image">-->
        <!--<vl-source-cluster :distance="50">-->
        <!--  <vl-source-vector :features="points" />-->
        <!--</vl-source-cluster>-->
        <!--<vl-style-func :factory="makeClusterStyleFunc" />-->
        <!--  <vl-style-func :factory="makePointStyleFunc" />-->
        <!--</vl-layer-vector>-->

        <vl-layer-vector id="draw-target">
          <vl-source-vector ident="draw-target" :features.sync="drawFeatures" />
        </vl-layer-vector>

        <!--<vl-interaction-select :features.sync="selectedFeatures" />-->
        <vl-interaction-draw v-if="drawingEnabled" source="draw-target" type="Polygon" />
        <vl-interaction-modify source="draw-target" />
        <vl-interaction-snap source="draw-target" />
      </vl-map>
    </div>
  </div>
</template>

<script>
  import { random, range, cloneDeep } from 'lodash'
  import { Feature } from 'ol'
  import { createStyle } from '../src/ol-ext'

  const drawFeature = {
    id: 1,
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [0, 30], [30, 30], [30, 0], [0, 0]]],
    },
  }

  export default {
    name: 'app',
    data () {
      return {
        zoom: 2,
        center: [100, 10],
        rotation: 0,
        mapVisible: true,
        countriesUrl: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
        countries: [],
        selectedFeatures: [],
        drawFeatures: [
          cloneDeep(drawFeature),
        ],
        points: range(0, 100).map(i => ({
          type: 'Feature',
          id: 'random-' + i,
          geometry: {
            type: 'Point',
            coordinates: [
              random(0, 50),
              random(0, 50),
            ],
          },
        })),
      }
    },
    computed: {
      selectedFeatureIds () {
        return this.selectedFeatures.map(({ id }) => id)
      },
      drawingEnabled () {
        return !this.drawFeatures.length
      },
    },
    methods: {
      createCountriesStyleFunc () {
        return () => {
          return createStyle({
            fillColor: 'rgba(0, 0, 0, 0.4)',
            strokeColor: 'blue',
          })
        }
      },
      makeClusterStyleFunc () {
        const cache = {}

        return function __clusterStyleFunc (feature) {
          const size = feature.get('features').length
          let style = cache[size]

          if (!style) {
            style = createStyle({
              imageRadius: 10,
              strokeColor: '#ffffff',
              fillColor: '#3399cc',
              text: size.toString(),
              textFillColor: '#ffffff',
            })

            cache[size] = style
          }

          return [style]
        }
      },
      makePointStyleFunc () {
        return feature => {
          return [
            createStyle({
              fillColor: 'red',
              strokeColor: 'green',
              strokeWidth: 2,
              imageRadius: 10,
              textScale: 1.4,
              text: feature.getId(),
              textAlign: 'end',
              textFillColor: '#fff',
            }),
          ]
        }
      },
      toggleMap () {
        this.drawFeatures = [
          cloneDeep(drawFeature),
        ]
        this.mapVisible = !this.mapVisible
      },
      async resetDrawFeatures () {
        this.drawFeatures = []

        await this.$nextTick()

        console.log('draw enabled', this.drawingEnabled)

        this.drawFeatures = [
          _.cloneDeep(drawFeature),
        ]

        await this.$nextTick()

        console.log('draw enabled', this.drawingEnabled)
      },
    },
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "~ol/ol";

  html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    box-sizing: border-box;
    font-family: Helvetica, Arial, sans-serif;
    overflow: hidden;

    * {
      box-sizing: border-box;
    }
  }

  .panel {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 70vw;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 20px rgba(2, 2, 2, 0.1);
    padding: 5px;
    text-align: center;
    z-index: 1;

    > button {
      margin: 5px;
      padding: 5px 10px;
      text-transform: uppercase;
    }
  }
</style>
