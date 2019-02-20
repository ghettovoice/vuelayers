<template>
  <div id="app">
    <div style="height: 100%">
      <div class="panel">
        <button @click="selectByHover = !selectByHover">Select by {{ !selectByHover ? 'hover' : 'click' }}</button>
        <button @click="graticule = !graticule">Graticule</button>
        <button @click="drawType = 'Polygon'">Draw polygon</button>
        <button @click="drawType = undefined">Stop draw</button>
        <div>
          {{ selectedFeatures }}
        </div>
      </div>

      <vl-map ref="map" v-if="showMap" data-projection="EPSG:4326" renderer="webgl">
        <vl-view :center.sync="center" :rotation.sync="rotation" :zoom.sync="zoom" ident="view" ref="view" />

        <!--<vl-graticule :show-labels="true" v-if="graticule">-->
          <!--<vl-style-stroke :line-dash="[5, 10]" color="green" slot="stroke"></vl-style-stroke>-->
          <!--<vl-style-text slot="lon" text-baseline="bottom">-->
            <!--<vl-style-stroke color="blue" />-->
          <!--</vl-style-text>-->
          <!--<vl-style-text slot="lat" text-align="end">-->
            <!--<vl-style-stroke color="black" />-->
          <!--</vl-style-text>-->
        <!--</vl-graticule>-->

        <!--<vl-interaction-select :condition="selectCondition" :features.sync="selectedFeatures">-->
          <!--<template slot-scope="select">-->
            <!--<vl-overlay class="feature-popup" v-for="feature in select.features" :key="feature.id" :id="feature.id"-->
                        <!--:position="pointOnSurface(feature.geometry)" :auto-pan="true"-->
                        <!--:auto-pan-animation="{ duration: 300 }"-->
                        <!--positioning="bottom-right">-->
              <!--<div style="background: #fff; padding: 10px; width: 200px">-->
                <!--{{ feature }}-->
              <!--</div>-->
            <!--</vl-overlay>-->
          <!--</template>-->
        <!--</vl-interaction-select>-->

        <vl-layer-tile>
          <vl-source-osm />
        </vl-layer-tile>

        <!--<vl-feature id="marker">-->
          <!--<vl-geom-point :coordinates="[0, 0]" />-->
        <!--</vl-feature>-->

        <vl-layer-vector id="features">
          <vl-source-vector :features.sync="features" />
        </vl-layer-vector>

        <!--<vl-layer-vector id="draw-pane" v-if="drawType != null">-->
          <!--<vl-source-vector :features.sync="drawnFeatures" ident="draw-target" />-->
        <!--</vl-layer-vector>-->

        <!--<vl-interaction-draw :type="drawType" source="draw-target" v-if="drawType != null" />-->
      </vl-map>
    </div>
  </div>
</template>

<script>
  import * as eventCondition from 'ol/events/condition'
  import { findPointOnSurface } from '../src/ol-ext'

  const features = [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [10, 10],
      },
    },
  ]

  const computed = {
    selectCondition () {
      return this.selectByHover ? eventCondition.pointerMove : eventCondition.singleClick
    },
  }

  const methods = {
    pointOnSurface: findPointOnSurface,
  }

  export default {
    name: 'app',
    computed,
    methods,
    data () {
      return {
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        features,
        selectedFeatures: [],
        graticule: false,
        showMap: true,
        drawType: undefined,
        drawnFeatures: [],
        selectByHover: false,
      }
    },
    mounted () {
      // setInterval(() => {
      //   this.features[0].geometry.coordinates = [
      //     this.features[0].geometry.coordinates[0] + 0.1,
      //     this.features[0].geometry.coordinates[1] + 0.1,
      //   ];
      // }, 100)
    }
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
