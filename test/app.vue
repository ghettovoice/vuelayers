<template>
  <div id="app">
    <div style="height: 100%">
      <div class="panel">
        <button @click="animate">Move animate</button>
        <button @click="selectByHover = !selectByHover">Select by {{ !selectByHover ? 'hover' : 'click' }}</button>
        <button @click="graticule = !graticule">Graticule</button>
        <button @click="drawType = 'Polygon'">Draw polygon</button>
        <button @click="drawType = undefined">Stop draw</button>
        <button @click="loadClusterFeatures">Load cluster features</button>
        <div>
          <input v-model="featureId" />
          <button @click="selectById">Select by id</button>
        </div>
        <div>
          {{ selectedFeatures }}
        </div>
      </div>

      <vl-map ref="map" v-if="showMap" data-projection="EPSG:4326">
        <vl-view :center.sync="center" :rotation.sync="rotation"
                 :zoom.sync="zoom" :extent="[0, 0, 100, 50]"
                 ident="view" ref="view" />

        <!--<vl-graticule :show-labels="true" v-if="graticule">-->
        <!--<vl-style-stroke :line-dash="[5, 10]" color="green" slot="stroke"></vl-style-stroke>-->
        <!--<vl-style-text slot="lon" text-baseline="bottom">-->
        <!--<vl-style-stroke color="blue" />-->
        <!--</vl-style-text>-->
        <!--<vl-style-text slot="lat" text-align="end">-->
        <!--<vl-style-stroke color="black" />-->
        <!--</vl-style-text>-->
        <!--</vl-graticule>-->

        <vl-interaction-select ref="selectInteraction" :condition="selectCondition" :features.sync="selectedFeatures">
          <template slot-scope="select">
            <vl-overlay class="feature-popup" v-for="feature in select.features" :key="feature.id" :id="feature.id"
                        :position="pointOnSurface(feature.geometry)" :auto-pan="true"
                        :auto-pan-animation="{ duration: 300 }"
                        class-name="ol-overlay-container ol-selectable smooth-transition"
                        positioning="bottom-right">
              <div style="background: #ffffff; padding: 10px; width: 200px">
                {{ feature }}
              </div>
            </vl-overlay>
          </template>
        </vl-interaction-select>

        <!--<vl-geoloc @update:position="onUpdatePosition">-->
        <!--  <template slot-scope="geoloc">-->
        <!--    <vl-feature v-if="geoloc.position" id="position-feature">-->
        <!--      <vl-geom-point :coordinates="geoloc.position" />-->
        <!--      <vl-style-box>-->
        <!--        <vl-style-icon :src="iconUrl" />-->
        <!--        &lt;!&ndash;<vl-style-circle :radius="7">&ndash;&gt;-->
        <!--        &lt;!&ndash;  <vl-style-stroke color="red" />&ndash;&gt;-->
        <!--        &lt;!&ndash;  <vl-style-fill color="blue" />&ndash;&gt;-->
        <!--        &lt;!&ndash;</vl-style-circle>&ndash;&gt;-->
        <!--      </vl-style-box>-->
        <!--    </vl-feature>-->
        <!--  </template>-->
        <!--</vl-geoloc>-->

        <vl-layer-tile>
          <vl-source-sputnik />
        </vl-layer-tile>

        <!--<vl-layer-vector id="dyn-url" render-mode="image">-->
        <!--  <vl-source-vector ref="dynUrlSource" :url="dynUrl" />-->
        <!--</vl-layer-vector>-->

        <!--<vl-feature id="marker">-->
        <!--<vl-geom-point :coordinates="[0, 0]" />-->
        <!--</vl-feature>-->

        <!--<vl-layer-group>-->
        <!--  <vl-layer-heatmap id="features" ref="featuresLayer" render-mode="image">-->
        <!--    <vl-source-vector :features.sync="features" ref="featuresSource" />-->
        <!--    &lt;!&ndash;<vl-style-func :factory="styleFuncFactory" />&ndash;&gt;-->
        <!--  </vl-layer-heatmap>-->

          <vl-layer-vector id="clusters" render-mode="image">
            <vl-source-cluster :distance="50">
              <vl-source-vector :features="clusterFeatures" />
            </vl-source-cluster>

            <vl-style-func :factory="makeClusterStyleFunc" />
          </vl-layer-vector>
        <!--</vl-layer-group>-->

        <!--<vl-layer-vector id="draw-pane">-->
        <!--  <vl-source-vector :features.sync="drawnFeatures" ident="drawTarget" />-->
        <!--</vl-layer-vector>-->

        <!--<vl-interaction-draw v-if="drawType" :type="drawType" source="drawTarget" />-->

        <!--<vl-interaction-modify source="drawTarget">-->
        <!--  <vl-style-box>-->
        <!--    <vl-style-circle :radius="5">-->
        <!--      <vl-style-stroke color="green" />-->
        <!--      <vl-style-fill color="green" />-->
        <!--    </vl-style-circle>-->
        <!--  </vl-style-box>-->
        <!--</vl-interaction-modify>-->
      </vl-map>
    </div>
  </div>
</template>

<script>
  import { cloneDeep, forEach, isFunction, random, range, throttle } from 'lodash'
  import { inAndOut } from 'ol/easing'
  import * as eventCondition from 'ol/events/condition'
  import Feature from 'ol/Feature'
  import Point from 'ol/geom/Point'
  import { createStyle, defaultStyle, findPointOnSurface, pointFromLonLat } from '../src/ol-ext'

  const features = range(0, 100).map(() => {
    let coordinate = [
      random(-50, 50),
      random(-50, 50),
    ]
    return {
      type: 'Feature',
      // id: 'random-' + i,
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
        resolution: 39135.75848201024,
        center: [100, 10],
        rotation: 0,
        features: [],
        featureAnimations: {},
        selectedFeatures: [],
        graticule: false,
        showMap: true,
        drawType: undefined,
        drawnFeatures: [
          {
            id: 'drawn-1',
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 20],
                  [20, 20],
                  [20, 0],
                  [0, 0],
                ],
              ],
            },
          },
        ],
        selectByHover: false,
        clusterFeatures: [],
        dynUrl: undefined,
        countriesUrl: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
        riversUrl: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_rivers_lake_centerlines.geojson',
        iconUrl: 'https://openlayers.org/en/latest/examples/data/icon.png',
        featureId: undefined,
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
              },
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
      loadClusterFeatures () {
        this.clusterFeatures = _.range(0, 100).map(i => {
          let coordinate = [
            _.random(-50, 50),
            _.random(-50, 50),
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
      onUpdatePosition (position) {
        console.log('geoloc pos', position)
      },
      selectById () {
        if (!this.featureId) return

        this.$refs.selectInteraction.select(this.featureId)
      },
    },
    mounted () {
      setTimeout(() => {
        this.features = cloneDeep(features)
      }, 1000)

      this.dynUrl = this.countriesUrl
      setInterval(() => {
        if (this.dynUrl === this.countriesUrl) {
          this.dynUrl = this.riversUrl
        } else {
          this.dynUrl = this.countriesUrl
        }
      }, 5000)
    },
    beforeDestroy () {
      forEach(this.featureAnimations, cancel => cancel())
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
