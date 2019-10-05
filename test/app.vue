<template>
  <div id="app">
    <div style="height: 100%">
      <div class="panel">
        <div>
          Selected:<br>
          {{ selectedFeatureIds }}
        </div>
      </div>

      <vl-map ref="map" data-projection="EPSG:4326" :default-controls="controls" :default-interactions="interactions">
        <vl-view :center.sync="center" :rotation.sync="rotation"
                 :zoom.sync="zoom" :extent="[0, 0, 100, 50]"
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

        <vl-layer-vector render-mode="image">
          <vl-source-cluster :distance="50">
            <vl-source-vector ref="placesSource" @mounted="getPlaceFeatures" />
          </vl-source-cluster>
          <vl-style-func :factory="makeClusterStyleFunc" />
        </vl-layer-vector>

        <!--<vl-layer-vector id="draw-target">-->
        <!--  <vl-source-vector ident="draw-target" :features.sync="drawFeatures" />-->
        <!--</vl-layer-vector>-->

        <!--<vl-interaction-select :features.sync="selectedFeatures" />-->
        <!--<vl-interaction-modify source="draw-target" />-->
      </vl-map>
    </div>
  </div>
</template>

<script>
  import { Feature } from 'ol'
  import { Point } from 'ol/geom'
  import { range, random } from 'lodash'
  import { createStyle, findPointOnSurface } from '../src/ol-ext'

  export default {
    name: 'app',
    data () {
      return {
        zoom: 2,
        resolution: 39135.75848201024,
        center: [100, 10],
        rotation: 0,
        countriesUrl: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
        countries: [],
        featureId: undefined,
        features: [],
        selectedFeatures: [],
        drawFeatures: [
          {
            type: 'Feature',
            id: '213456789',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [0, 0],
                [20, 0],
                [20, 20],
                [0, 20],
                [0, 0],
              ]],
            },
          },
        ],
        controls: true,
        interactions: true,
        places: range(0, 100).map(i => ({
          id: 'random-' + i,
          geo: [
            random(0, 50),
            random(0, 50),
          ],
        })),
      }
    },
    computed: {
      selectedFeatureIds () {
        return this.selectedFeatures.map(({ id }) => id)
      },
    },
    methods: {
      pointOnSurface: findPointOnSurface,
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
      getPlaceFeatures () {
        const sourceVm = this.$refs.placesSource
        sourceVm.$source.clear()

        const features = this.places.map(place => {
          const geometry = new Point(place.geo)
          geometry.transform('EPSG:4326', 'EPSG:3857')

          let feature = new Feature({ geometry })
          feature.setProperties(place)
          feature.setId(place.id)

          return feature
        })

        sourceVm.$source.addFeatures(features)
      },
    },
    mounted () {
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

  .smooth-transition {
    transition: all 0.3s ease-in-out;
  }
</style>
