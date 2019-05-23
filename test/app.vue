<template>
  <div id="app">
    <div style="height: 100%">
      <div class="panel">
        <button @click="animate">Move animate</button>
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
                        class-name="ol-overlay-container ol-selectable smooth-transition"
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

        <vl-layer-vector id="features" ref="featuresLayer" render-mode="image">
          <vl-source-vector :features.sync="features" ref="featuresSource" />
          <vl-style-func :factory="styleFuncFactory" />
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
  import { isFunction, range, random, forEach, throttle } from 'lodash'
  import * as eventCondition from 'ol/events/condition'
  import { inAndOut } from 'ol/easing'
  import Feature from 'ol/Feature'
  import Point from 'ol/geom/Point'
  import { findPointOnSurface, defaultStyle, createStyle, pointFromLonLat } from '../src/ol-ext'

  const features = range(0, 100).map(i => {
      let coordinate = [
        random(-50, 50),
        random(-50, 50),
      ]
      return {
        type: 'Feature',
        id: 'random-' + i,
        geometry: {
          type: 'Point',
          coordinates: coordinate,
        },
      }
    })

  export default {
    name: 'app',
    data () {
      return {
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        features: [],
        featureAnimations: {},
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
      styleFuncFactory () {
        const style = createStyle(defaultStyle()[0])

        return feature => {
          if (feature.get('animating') === true) {
            return null
          }

          return [style]
        }
      },
      animate () {
        requestAnimationFrame(() => {
          this.features.forEach(feature => {
            this.animateFeature(
              feature,
              [random(-50, 50), random(-50, 50)],
              throttle((lon, lat) => {
                feature.geometry.coordinates = [lon, lat]
              }, 10),
              undefined,
              (lon, lat) => {
                feature.geometry.coordinates = [lon, lat]
              }
            )
          })
        })
      },
      animateFeature (feature, destCoord, step, done) {
        if (this.featureAnimations[feature.id]) {
          this.featureAnimations[feature.id]()
        }

        this.$refs.featuresSource.getFeatureById(feature.id).set('animating', true)

        let duration = 2000
        let now = Date.now()
        let start = Date.now()
        let elapsed = 0
        let complete = false
        let progress = 0
        let x, y

        const animate = evt => {
          const vectorContext = evt.vectorContext

          now = Date.now()
          elapsed = now - start

          let fraction = elapsed / duration
          if (fraction >= 1) {
            fraction = 1
            complete = true
          }
          if (complete) {
            this.featureAnimations[feature.id]()

            return
          }

          progress = inAndOut(fraction)

          let x0 = feature.geometry.coordinates[0]
          let y0 = feature.geometry.coordinates[1]
          let x1 = destCoord[0]
          let y1 = destCoord[1]
          x = x0 + progress * (x1 - x0)
          y = y0 + progress * (y1 - y0)

          if (isFunction(step)) {
            step(x, y, progress)
          }

          let currentPoint = new Point(pointFromLonLat([x, y]))
          let animFeature = new Feature(currentPoint)
          vectorContext.drawFeature(animFeature, createStyle(defaultStyle()[0]))

          this.$refs.map.$map.render()
        }

        this.featureAnimations[feature.id] = () => {
          this.$refs.map.$map.un('postcompose', animate)

          delete this.featureAnimations[feature.id]

          if (isFunction(done)) {
            done(x, y, progress)
          }

          this.$refs.featuresSource.getFeatureById(feature.id).set('animating', false)
        }

        this.$refs.map.$map.on('postcompose', animate)
        this.$refs.map.$map.render()
      },
    },
    mounted () {
      setTimeout(() => {
        this.features = features.slice()
      }, 1000)
    },
    beforeDestroy () {
      forEach(this.featureAnimations, cancel => cancel())
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

  .smooth-transition {
    transition: all 0.3s ease-in-out;
  }
</style>
