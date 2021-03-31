<template>
  <div id="app">
    <button @click="features = savedFeatures.slice()">set</button>
    <button @click="features = []">unset</button>
    <vl-map ref="map" data-projection="EPSG:4326" :default-controls="false">
      <vl-view :center.sync="center" :rotation.sync="rotation" :zoom.sync="zoom"
               ident="view" ref="view" />

      <vl-layer-tile id="osm">
        <vl-source-osm />
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-source-cluster>
          <vl-source-vector ident="target" :features.sync="features" />
        </vl-source-cluster>
      </vl-layer-vector>

      <vl-layer-vector-tile ref="vectorTileLayer">
        <vl-source-vector-tile :url="url" :format-factory="createMvtFormat" />
      </vl-layer-vector-tile>

      <vl-interaction-select :features.sync="selectedFeatures" />
    </vl-map>
  </div>
</template>

<script>
  import { Feature } from 'ol'
  import { MVT } from 'ol/format'
  import { range, random } from 'lodash'

  export default {
    name: 'app',
    data () {
      return {
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        features: [],
        savedFeatures: range(1, 500).map(i => ({
          type: 'Feature',
          id: 'f' + i,
          geometry: {
            type: 'Point',
            coordinates: [
              random(-5, 5),
              random(-5, 5),
            ],
          },
        })),
        selectedFeatures: [],
        url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
      }
    },
    methods: {
      createMvtFormat () {
        return new MVT({
          featureClass: Feature,
        })
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
