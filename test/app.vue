<template>
  <div id="app">
    <div style="height: 100%">
      <div class="panel">
        <div>
          Selected:<br>
          {{ selectedFeatureIds }}
        </div>
      </div>

      <VlMap
        ref="map"
        data-projection="EPSG:4326"
        :default-controls="controls"
        :default-interactions="interactions">
        <VlView
          ref="view"
          :center.sync="center"
          :rotation.sync="rotation"
          :zoom.sync="zoom" />

        <VlGeoloc>
          <template slot-scope="geoloc">
            <VlFeature
              v-if="geoloc.position"
              id="position-feature">
              <VlGeomPoint :coordinates="geoloc.position" />
            </VlFeature>
          </template>
        </VlGeoloc>

        <VlLayerTile>
          <VlSourceOsm />
        </VlLayerTile>

        <!--<VlLayerVector-->
        <!--  id="countries"-->
        <!--  render-mode="image">-->
        <!--  <VlSourceVector-->
        <!--    ident="countries-source"-->
        <!--    :features.sync="countries"-->
        <!--    :url="countriesUrl" />-->
        <!--  <VlStyleFunc :factory="createCountriesStyleFunc" />-->
        <!--</VlLayerVector>-->

        <!--<VlLayerVector id="draw-target">-->
        <!--  <VlSourceVector-->
        <!--    ident="draw-target"-->
        <!--    :features.sync="drawFeatures" />-->
        <!--</VlLayerVector>-->

        <!--<VlInteractionSelect :features.sync="selectedFeatures" />-->
        <!--<VlInteractionModify source="draw-target" />-->
      </VlMap>
    </div>
  </div>
</template>

<script>
  import { findPointOnSurface, createStyle } from '../src/ol-ext'

  export default {
    name: 'App',
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
      }
    },
    computed: {
      selectedFeatureIds () {
        return this.selectedFeatures.map(({ id }) => id)
      },
    },
    mounted () {
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
