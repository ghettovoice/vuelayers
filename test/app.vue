<template>
  <div id="app">
    <div style="height: 50%">
      <vl-map ref="map" @created="log('created')" @mounted="log('mounted')" @destroyed="log('destroyed')">
        <vl-view ref="view" ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

        <vl-geoloc>
          <template slot-scope="ctx">
            <vl-feature v-if="ctx.position" id="my-geoloc">
              <vl-geom-point :coordinates="ctx.position" />
              <vl-style-box>
                <vl-style-circle :radius="7">
                  <vl-style-fill color="#abcabc" />
                  <vl-style-stroke color="#ff22ff" :width="5" />
                </vl-style-circle>
              </vl-style-box>
            </vl-feature>
          </template>
        </vl-geoloc>

        <vl-interaction-select @select="select" :features.sync="selectedFeatures"/>

        <vl-layer-tile id="sputnik">
          <vl-source-sputnik/>
        </vl-layer-tile>

        <vl-layer-vector id="points" v-if="pointsLayer">
          <vl-source-cluster>
            <vl-source-vector :features="points"/>
          </vl-source-cluster>
        </vl-layer-vector>

        <vl-layer-tile id="wmts">
          <vl-source-wmts
            url="https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/"
            layer-name="0" matrix-set="EPSG:3857" format="image/png" style-name="default"/>
        </vl-layer-tile>

        <vl-layer-vector>
          <vl-source-vector>
            <vl-feature :id="polyId" ref="poly" :properties="{qwerty: 123}">
              <template slot-scope="feature">
                <vl-geom-polygon :coordinates.sync="polygonCoords"/>
                <vl-overlay v-if="selected.includes(feature.id)" :position="pointOnSurface(feature.geometry)">
                  <div style="background: #eee; padding: 10px 20px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);">
                    poly feature {{ polyId }}
                    qwerty: {{ feature.properties.qwerty }}
                  </div>
                </vl-overlay>
              </template>
            </vl-feature>
          </vl-source-vector>

          <vl-style-box>
            <vl-style-fill :color="[45, 156, 201, 0.4]"/>
            <vl-style-stroke :color="[55, 55, 55, 0.8]" :width="4"/>
          </vl-style-box>
        </vl-layer-vector>
      </vl-map>
    </div>
    <div style="height: 50%">
      <vl-map>
        <vl-view ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

        <vl-layer-tile>
          <vl-source-osm/>
        </vl-layer-tile>

        <vl-layer-tile id="wms">
          <vl-source-wms url="https://ahocevar.com/geoserver/wms" layers="topp:states"
                         :ext-params="{ TILED: true }" server-type="geoserver"/>
        </vl-layer-tile>

        <vl-layer-vector id="countries">
          <vl-source-vector url="https://openlayers.org/en/v4.3.2/examples/data/geojson/countries.geojson" />
        </vl-layer-vector>

        <vl-overlay v-if="selectedFeatures.length && selectedFeatures[0].properties && selectedFeatures[0].properties.features"
                    :position="pointOnSurface(selectedFeatures[0].geometry)">
          <div style="background: #eee; padding: 10px 20px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);">
            Popup cluster feature {{ selectedFeatures[0].id }}<br />
            <span v-for="feature in selectedFeatures[0].properties.features">
              feature {{ feature.id }}
            </span>
          </div>
        </vl-overlay>
      </vl-map>
    </div>
  </div>
</template>

<script>
  import { range, random } from 'lodash/fp'
  import { core } from '../src'

  const computed = {
  }

  const methods = {
    log: ::console.log,
    select ({ feature }) {
      if (feature.get('features') && feature.get('features').length > 1) {
        this.selectedFeatures = this.selectedFeatures.filter(id => id !== feature.getId())
        this.$refs.view.fit(core.geomHelper.collection(feature.get('features').map(f => f.getGeometry())).getExtent(), {
          duration: 500,
        })
      }
    },
    loadData () {
      const points = []
      range(1, 20).forEach(i => {
        points.push({
          type: 'Feature',
          id: i,
          properties: {
            id: i,
          },
          geometry: {
            type: 'Point',
            coordinates: [
              random(-179, 179),
              random(-89, 89),
            ],
          },
        })
      })

      this.points = points

      return Promise.resolve(this.points)
    },
    pointOnSurface (geometry) {
      return core.geomHelper.pointOnSurface(geometry)
    },
  }

  export default {
    name: 'app',
    computed,
    methods,
    data () {
      return {
        zoom: 2,
        center: [ 0, 0 ],
        rotation: 0,
        points: [],
        pointsLayer: true,
        polyId: '123',
        polygonCoords: [[[0, 0], [10, 10], [10, 0], [0, 0]]],
        selected: [],
        selectedFeatures: [],
      }
    },
    mounted () {
      this.loadData()
    },
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "~ol/ol.css";

  html, body, #app {
    width       : 100%;
    height      : 100%;
    margin      : 0;
    box-sizing  : border-box;
    font-family : Helvetica, Arial, sans-serif;
    overflow    : hidden;

    * {
      box-sizing : border-box;
    }
  }

  .controls {
    position   : absolute;
    bottom     : 10px;
    left       : 50%;
    transform  : translateX(-50%);
    width      : 70vw;
    background : rgba(255, 255, 255, 0.7);
    box-shadow : 0 0 20px rgba(2, 2, 2, 0.1);
    padding    : 5px;
    text-align : center;

    > button {
      margin         : 5px;
      padding        : 5px 10px;
      text-transform : uppercase;
    }
  }
</style>
