<template>
  <div id="app">
    <div style="height: 100%">
      <div class="controls">
        <button @click="drawType = 'point'">Point</button>
        <button @click="drawType = 'line_string'">LineString</button>
        <button @click="drawType = 'polygon'">Polygon</button>
        <button @click="drawType = 'circle'">Circle</button>
        <button @click="drawType = undefined">Reset</button>
      </div>

      <vl-map ref="map" @created="log('created')" @mounted="log('mounted')" @destroyed="log('destroyed')"
              @singleclick="clickCoord = $event.coordinate" data-projection="EPSG:4326">
        <vl-view ref="view" ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation">
          <vl-overlay slot-scope="view" v-if="view.center" :position="view.center">
            <div style="background: #eee; padding: 1rem">
              Center: {{ view.center }}<br>
              Zoom: {{ view.zoom }}<br>
              Resolution: {{ view.resolution }}<br>
              Rotation: {{ view.rotation }}<br>
            </div>
          </vl-overlay>
        </vl-view>

        <vl-geoloc @update:position="log($event)">
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

        <vl-layer-tile id="sputnik">
          <vl-source-sputnik/>
        </vl-layer-tile>

        <vl-layer-tile id="bing-maps">
          <vl-source-bing-maps :api-key="bingMapsKey" :imagery-set="bingMapsImagerySet"></vl-source-bing-maps>
        </vl-layer-tile>

        <vl-layer-tile>
          <vl-source-mapbox access-token="qwerty" map-id="mapbox.light" tile-format="png"></vl-source-mapbox>
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
          <vl-source-vector @addfeature="log('addfeature', $event)">
            <vl-feature :id="polyId" ref="poly" :properties="{qwerty: 123}">
              <template slot-scope="feature">
                <vl-geom-polygon v-if="polygonCoords.length" :coordinates="polygonCoords"/>
                <vl-overlay v-if="selected.includes(feature.id)" :position="feature.point">
                  <div style="background: #eee; padding: 10px 20px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);">
                    poly feature {{ polyId }}
                    qwerty: {{ feature.properties.qwerty }}
                  </div>
                </vl-overlay>
              </template>
            </vl-feature>

            <vl-feature id="circle">
              <vl-geom-circle :coordinates="circleCoordinates" :radius="5000000"></vl-geom-circle>
            </vl-feature>
          </vl-source-vector>

          <vl-style-box>
            <vl-style-fill :color="[45, 156, 201, 0.4]"/>
            <vl-style-stroke :color="[55, 55, 55, 0.8]" :width="4"/>
            <vl-style-circle>
              <vl-style-fill :color="[45, 156, 201, 0.4]"/>
              <vl-style-stroke :color="[55, 55, 55, 0.8]" :width="4"/>
            </vl-style-circle>
          </vl-style-box>
        </vl-layer-vector>

        <vl-layer-vector id="draw-layer">
          <vl-source-vector :features.sync="drawnFeatures" ident="draw-target" />
        </vl-layer-vector>

        <!--<vl-layer-image id="jz">-->
          <!--<vl-source-image-static-->
            <!--:url="imageUrl"-->
            <!--:size="imageSize"-->
            <!--:extent="imageExtent"-->
            <!--:projection="imageProj">-->
          <!--</vl-source-image-static>-->
        <!--</vl-layer-image>-->

        <vl-interaction-select ident="select" @select="log('select', $event)" @unselect="log('unselect', $event)" :features.sync="selectedFeatures"/>
        <vl-interaction-draw v-if="drawType" :type="drawType" source="draw-target" @drawstart="log('drawstart', $event)" @drawend="log('drawend', $event)" />
        <vl-interaction-modify source="draw-target" @drawstart="log('modifystart', $event)" @drawend="log('modifyend', $event)" />
        <vl-interaction-snap source="draw-target" :priority="10" />

        <!--<vl-overlay v-if="clickCoord" :position="clickCoord">-->
          <!--<div style="background: white; padding: 10px">-->
        <!--    {{ clickCoord }}-->
        <!--    <button @click="clickCoord = undefined">close</button>-->
          <!--</div>-->
      <!--  </vl-overlay>-->

        <!--<vl-layer-vector id="countries">-->
        <!--<vl-source-vector :features.sync="countries" url="https://openlayers.org/en/v4.3.2/examples/data/geojson/countries.geojson" />-->
        <!--</vl-layer-vector>-->

        <!--<vl-layer-vector id="wfs">-->
        <!--<vl-source-vector :features.sync="wfsFeatures" :url="wfsUrlFunc" :strategy-factory="bboxStrategyFactory" />-->
        <!--</vl-layer-vector>-->
      </vl-map>
    </div>
    <!--<div style="height: 50%">-->
      <!--<vl-map>-->
        <!--<vl-view ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"/>-->

        <!--<vl-layer-tile>-->
          <!--<vl-source-osm/>-->
        <!--</vl-layer-tile>-->

        <!--<vl-layer-tile id="wms">-->
          <!--<vl-source-wms url="https://ahocevar.com/geoserver/wms" layers="topp:states"-->
                         <!--:ext-params="{ TILED: true }" server-type="geoserver"/>-->
        <!--</vl-layer-tile>-->

        <!--<vl-layer-vector id="countries">-->
          <!--<vl-source-vector :features.sync="countries" url="https://openlayers.org/en/v4.3.2/examples/data/geojson/countries.geojson" />-->
        <!--</vl-layer-vector>-->

        <!--<vl-layer-vector id="wfs">-->
          <!--<vl-source-vector :features.sync="wfsFeatures" :url="wfsUrlFunc" :strategy-factory="bboxStrategyFactory" />-->
        <!--</vl-layer-vector>-->

        <!--<vl-overlay v-if="selectedFeatures.length && selectedFeatures[0].properties && selectedFeatures[0].properties.features"-->
                    <!--:position="findPointOnSurface(selectedFeatures[0].geometry)">-->
          <!--<div style="background: #eee; padding: 10px 20px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);">-->
            <!--Popup cluster feature {{ selectedFeatures[0].id }}<br />-->
            <!--<span v-for="feature in selectedFeatures[0].properties.features">-->
              <!--feature {{ feature.id }}-->
            <!--</span>-->
          <!--</div>-->
        <!--</vl-overlay>-->
      <!--</vl-map>-->
    <!--</div>-->
  </div>
</template>

<script>
  import { random, range } from 'lodash/fp'
  import { createProj, addProj } from '@/ol-ext/proj'
  import { loadingBBox } from '@/ol-ext/load-strategy'
  import { findPointOnSurface } from '@/ol-ext/geom'
  import ScaleLine from 'ol/control/scaleline'

  const computed = {
    selected () {
      return this.selectedFeatures.map(feature => feature.id)
    },
  }

  const methods = {
    log: ::console.log,
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
      return findPointOnSurface(geometry)
    },
    bboxStrategyFactory () {
      return loadingBBox
    },
    wfsUrlFunc (extent, resolution, projection) {
      return 'https://ahocevar.com/geoserver/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&typename=osm:water_areas&' +
        'outputFormat=application/json&srsname=' + projection + '&' +
        'bbox=' + extent.join(',') + ',' + projection
    },
  }

  let x = 1024 * 10000
  let y = 968 * 10000
  let imageExtent = [-x / 2, -y / 2, x / 2, y / 2]
  let customProj = createProj({
    code: 'xkcd-image',
    units: 'pixels',
    extent: imageExtent,
  })
  addProj(customProj)

  export default {
    name: 'app',
    computed,
    methods,
    data () {
      return {
        zoom: 3,
        center: [-80.0307892780456, 43.456341754866685],
        rotation: 0,
        points: [],
        pointsLayer: true,
        polyId: '123',
        polygonCoords: [],
        selectedFeatures: [],
        countries: [],
        wfsFeatures: [],
        imageProj: customProj.getCode(),
        imageUrl: 'https://imgs.xkcd.com/comics/online_communities.png',
        imageSize: [1024, 968],
        imageExtent,
        clickCoord: undefined,
        drawnFeatures: [],
        drawType: undefined,
        circleCoordinates: [-40, -40],
        bingMapsKey: 'ArbsA9NX-AZmebC6VyXAnDqjXk6mo2wGCmeYM8EwyDaxKfQhUYyk0jtx6hX5fpMn',
        bingMapsImagerySet: 'Aerial',
      }
    },
    mounted () {
      this.loadData()

      this.$refs.map.$createPromise.then(() => {
        this.$refs.map.$map.addControl(new ScaleLine())
      })

      setTimeout(() => {
        this.polygonCoords = [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]
      }, 1000)
      setTimeout(() => {
        this.polygonCoords = [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]
      }, 3000)
    },
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "~ol/ol";

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
