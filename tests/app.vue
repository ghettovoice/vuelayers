<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        ref="view"
        :center.sync="center"
        :rotation.sync="rotation"
        :zoom.sync="zoom" />

      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <vl-layer-vector>
        <vl-source-vector :features="features" />
        <vl-style-func :factory="newLayerStyleFunc" />
      </vl-layer-vector>

      <vl-layer-vector>
        <vl-source-vector>
          <vl-feature id="another">
            <vl-geom-point :coordinates="[-20, -20]" />
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>

      <vl-interaction-select>
        <template slot-scope="select">
          <vl-style-func :factory="newSelectStyleFunc" />
          <vl-overlay
            v-for="feature in select.features"
            :id="feature.id"
            :key="feature.id"
            :position="feature.geometry.coordinates"
            :auto-pan="true"
            :auto-pan-animation="{ duration: 300 }"
            positioning="bottom-center">
            <div class="feature-popup">
              <section class="card">
                <header class="modal-header">
                  <span
                    class="close-modal"
                    @click="selectedFeatures = selectedFeatures.filter(f => f.id !== feature.id)">
                    <i class="fal fa-times" />
                  </span>
                </header>
                <div class="card-content">
                  <div class="content">
                    <h1>Test</h1>
                  </div>
                </div>
              </section>
            </div>
          </vl-overlay>
        </template>
      </vl-interaction-select>
    </VlMap>
  </div>
</template>

<script>
  import { Style, Icon, Circle, Fill, Stroke } from 'ol/style'

  export default {
    name: 'App',
    data () {
      return {
        zoom: 3,
        center: [0, 0],
        rotation: 0,
        features: [
          {
            type: 'Feature',
            id: 'one',
            geometry: {
              type: 'Point',
              coordinates: [10, 10],
            },
          },
          {
            type: 'Feature',
            id: 'two',
            geometry: {
              type: 'Point',
              coordinates: [30, 30],
            },
          },
        ],
      }
    },
    computed: {
      layerFeatureIds () {
        return this.features.map(f => f.id)
      },
    },
    methods: {
      newLayerStyleFunc (scale = 0.1) {
        return () => {
          return [
            new Style({
              image: new Icon({
                src: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
                scale,
              }),
            }),
          ]
        }
      },
      newSelectStyleFunc () {
        const defStyle = new Style({
          image: new Circle({
            fill: new Fill({
              color: 'blue',
            }),
            stroke: new Stroke({
              color: 'white',
              width: 2,
            }),
            radius: 7,
          }),
        })
        const layerStyleFunc = this.newLayerStyleFunc(0.3)

        return (feature, resolution) => {
          if (this.layerFeatureIds.includes(feature.getId())) {
            return layerStyleFunc(feature, resolution)
          }

          return [
            defStyle,
          ]
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
</style>
