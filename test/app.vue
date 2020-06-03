<template>
  <div id="app">
    <div class="panel">
    </div>

    <vl-map ref="map" data-projection="EPSG:4326">
      <vl-view :center.sync="center" :rotation.sync="rotation" :zoom.sync="zoom"
               ident="view" ref="view" />

      <vl-layer-tile id="osm">
        <vl-source-osm />
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-source-vector ident="draw" ref="vectorSource" :features.sync="features" :loader-factory="loader"></vl-source-vector>
        <vl-style-func :factory="styleFactory" />
      </vl-layer-vector>

      <vl-interaction-select ident="modify" :features.sync="selectedFeatures" />
    </vl-map>
  </div>
</template>

<script>
  import { createStyle, readGeoJsonFeature } from '../src/ol-ext'

  export default {
    name: 'app',
    data () {
      return {
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        features: [],
        selectedFeatures: [],
      }
    },
    computed: {
      selectedFeatureIds () {
        return this.selectedFeatures.map(({ id }) => id)
      },
    },
    methods: {
      loader () {
        return async () => {
          await this.loadFeatures()
        }
      },
      loadFeatures() {
        return new Promise(resolve => {
          setTimeout(() => {
            // generate GeoJSON random features
            const features = [{
              type: "Feature",
              geometry: {
                type: 'Point',
                coordinates: [5.44921875, 26.745610382199022],
              },
              properties: {
                active: false,
              },
            },
              {
                type: "Feature",
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [
                        -23.37890625,
                        45.336701909968134,
                      ],
                      [
                        -49.39453125,
                        33.137551192346145,
                      ],
                      [
                        -47.4609375,
                        3.6888551431470478,
                      ],
                      [
                        -20.390625,
                        -8.059229627200192,
                      ],
                      [
                        -13.0078125,
                        20.138470312451155,
                      ],
                      [
                        -23.37890625,
                        45.336701909968134,
                      ],
                    ],
                  ],
                },
                properties: {
                  active: true,
                },
              },
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [
                      44.47265625,
                      -1.7575368113083125,
                    ],
                    [
                      23.5546875,
                      9.795677582829743,
                    ],
                    [
                      47.109375,
                      23.241346102386135,
                    ],
                    [
                      22.8515625,
                      33.137551192346145,
                    ],
                    [
                      48.33984375,
                      42.032974332441405,
                    ],
                    [
                      19.86328125,
                      48.574789910928864,
                    ],
                    [
                      47.8125,
                      56.65622649350222,
                    ],
                  ],
                },
                properties: {
                  active: false,
                },
              },
            ]
            features.forEach(feature => {
              feature = readGeoJsonFeature(feature)
              this.$refs.vectorSource.addFeature(feature)
            })
            resolve()
          }, 3000)
        })
      },
      styleFactory() {
        const defStyle = createStyle({
          fillColor: 'white',
          strokeColor: 'blue',
          imageRadius: 5,
          imageFillColor: 'white',
          imageStrokeColor: 'blue',
        })
        const activeStyle = createStyle({
          fillColor: 'white',
          strokeColor: 'red',
          imageRadius: 5,
          imageFillColor: 'white',
          imageStrokeColor: 'red',
        })
        return feature => {
          if (feature.get('active')) {
            return [activeStyle]
          }
          return [defStyle]
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
</style>
