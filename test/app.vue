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

      <vl-map ref="map" v-if="showMap" data-projection="EPSG:4326">
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

        <vl-interaction-select :condition="selectCondition" :features.sync="selectedFeatures">
          <template slot-scope="select">
            <vl-overlay class="feature-popup" v-for="feature in select.features" :key="feature.id" :id="feature.id"
                        :position="pointOnSurface(feature.geometry)" :auto-pan="true"
                        :auto-pan-animation="{ duration: 300 }"
                        positioning="bottom-right">
              <div style="background: #fff; padding: 10px; width: 200px">
                {{ feature }}
              </div>
            </vl-overlay>
          </template>
        </vl-interaction-select>

        <vl-layer-tile>
          <vl-source-sputnik />
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
  import { inAndOut } from 'ol/easing'
  import faker from 'faker'
  import { findPointOnSurface } from '../src/ol-ext'
  import { isFunction } from '../src/util/minilo'

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

  export default {
    name: 'app',
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
    computed: {
      selectCondition () {
        return this.selectByHover ? eventCondition.pointerMove : eventCondition.singleClick
      },
    },
    methods: {
      pointOnSurface: findPointOnSurface,
      animateCoordinate (sourceCoord, destCoord, predicate, done) {
        let duration = 1000
        let now = Date.now()
        let start = Date.now()
        let elapsed = 0
        let complete = false

        const animate = () => {
          now = Date.now()
          elapsed = now - start
          let fraction = elapsed / duration
          if (fraction >= 1) {
            fraction = 1
            complete = true
          }
          let progress = inAndOut(fraction)

          let x0 = sourceCoord[0]
          let y0 = sourceCoord[1]
          let x1 = destCoord[0]
          let y1 = destCoord[1]
          let x = x0 + progress * (x1 - x0)
          let y = y0 + progress * (y1 - y0)

          predicate(x, y)

          if (complete) {
            if (isFunction(done)) {
              done(x, y)
            }
          } else {
            requestAnimationFrame(animate)
          }
        }

        requestAnimationFrame(animate)
      },
    },
    mounted () {
      setInterval(() => {
        this.animateCoordinate(
          this.features[0].geometry.coordinates,
          [faker.random.number({ min: -30, max: 30 }), faker.random.number({ min: -30, max: 30 })],
          (lon, lat) => {
            this.features[0].geometry.coordinates = [lon, lat]
          }
        )
      }, 3000)
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
