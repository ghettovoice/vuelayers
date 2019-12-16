<template>
  <div id="app">
    <div style="height: 100%">
      <div class="panel">
        <div>
          Selected: {{ selectedFeatureIds }}
        </div>
        <div>
          <button @click="onUnselectClick">Unselect</button>
        </div>
      </div>

      <vl-map ref="map" data-projection="EPSG:4326" @created="mapCreated">
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

        <vl-layer-vector id="countries" render-mode="image">
          <vl-source-vector ident="countries-source" ref="vectorSource" :features.sync="countries" :url="countriesUrl" />
        </vl-layer-vector>

        <vl-interaction-select :features.sync="selectedFeatures" />
      </vl-map>
    </div>
  </div>
</template>

<script>
  import { DragBox } from 'ol/interaction'
  import { platformModifierKeyOnly } from 'ol/events/condition'
  import { writeGeoJsonFeature } from '../src/ol-ext'

  export default {
    name: 'app',
    data () {
      return {
        zoom: 2,
        center: [100, 10],
        rotation: 0,
        countriesUrl: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
        countries: [],
        selectedFeatures: [],
      }
    },
    computed: {
      selectedFeatureIds () {
        return this.selectedFeatures.map(({ id }) => id)
      },
    },
    methods: {
      onUnselectClick () {
        if (this.selectedFeatureIds.length) {
          this.unselect(this.selectedFeatureIds[0])
        }
      },
      unselect (id) {
        const mapFeatureIndex = this.selectedFeatures.findIndex((f) => f.id === id)

        if (mapFeatureIndex !== -1) {
          this.selectedFeatures.splice(mapFeatureIndex, 1)
        }
      },
      mapCreated (map) {
        const dragBox = new DragBox({
          condition: platformModifierKeyOnly
        })

        map.$map.addInteraction(dragBox)

        dragBox.on('boxend', () => {
          // features that intersect the box are added to the collection of
          // selected features
          const extent = dragBox.getGeometry().getExtent()
          /** @var {ol.source.Vector} source */
          const source = this.$refs.vectorSource.$source

          source.forEachFeatureIntersectingExtent(extent, feature => {
            feature = writeGeoJsonFeature(feature)
            this.selectedFeatures.push(feature)
          })
        })

        // clear selection when drawing a new box and when clicking on the map
        dragBox.on('boxstart', () => {
          this.selectedFeatures = []
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
