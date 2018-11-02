<template>
  <div id="app">
    <div style="height: 100%">

      <vl-map v-if="showMap" ref="map" @created="log('created', $event)" @mounted="log('mounted', $event)"
              @destroyed="log('destroyed', $event)" @singleclick="clickCoord = $event.coordinate"
              data-projection="EPSG:4326">
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
          <vl-source-stamen layer="toner-lite"/>
        </vl-layer-tile>

        <vl-layer-group>
          <vl-layer-tile id="wms">
            <vl-source-wms url="https://ahocevar.com/geoserver/wms" layers="topp:states" :ext-params="{ TILED: true }" server-type="geoserver"/>
          </vl-layer-tile>
          <vl-layer-image id="wms-image">
            <vl-source-image-wms url="https://ahocevar.com/geoserver/wms" layers="topp:states" server-type="geoserver"/>
          </vl-layer-image>

          <vl-layer-vector id="points" v-if="pointsLayer">
            <vl-source-cluster>
              <vl-source-vector :features="points"/>
            </vl-source-cluster>
            <vl-style-func :factory="clusterStyleFunc"></vl-style-func>
          </vl-layer-vector>
        </vl-layer-group>

        <vl-layer-tile>
          <vl-source-arc-gis-rest url="https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StateCityHighway_USA/MapServer"></vl-source-arc-gis-rest>
        </vl-layer-tile>

        <vl-interaction-select ident="select" @select="log('select', $event)" @unselect="log('unselect', $event)" :features.sync="selectedFeatures"/>

        <vl-overlay v-if="selectedFeatures.length && selectedFeatures[0].properties && selectedFeatures[0].properties.features"
                    :position="pointOnSurface(selectedFeatures[0].geometry)" :auto-pan="true" :auto-pan-animation="{ duration: 250 }">
          <div style="background: #eee; padding: 10px 20px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3); width: 200px">
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
  import { findPointOnSurface } from '@/ol-ext/geom'
  import { loadingBBox } from '@/ol-ext/load-strategy'
  import { addProj, createProj } from '@/ol-ext/proj'
  import { createStyle } from '@/ol-ext/style'
  import { random, range } from 'lodash/fp'
  import ScaleLine from 'ol/control/scaleline'

  let fakerator = Fakerator()

  const computed = {
    selected () {
      return this.selectedFeatures.map(feature => feature.id)
    },
    eventSourcedFeatureIds () {
      return this.eventSourcedFeatures.map(feature => feature.id)
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

    // request remote source for the new features
  	requestNewFeatures () {
    	this.loadFeatures().then(features => {
      	let newFeatures = features.reduce((newFeatures, feature) => {
          if (this.eventSourcedFeatureIds.includes(feature.id) === false) {
            newFeatures.push(Object.freeze(feature))
          }
          return newFeatures
        }, [])
        this.eventSourcedFeatures = this.eventSourcedFeatures.concat(newFeatures)

        setTimeout(() => {
        	this.requestNewFeatures()
        }, 5 * 1000)
      })
    },
  	// emulates external source
  	loadFeatures () {
    	return new Promise(resolve => {
      	setTimeout(() => {
        	// generate GeoJSON random features
        	let features = Array.from({
          	length: fakerator.random.number(1, 5),
          }).map(() => {
            let geolocation = fakerator.address.geoLocation()

          	return {
              type: "Feature",
              id: fakerator.misc.uuid(),
              geometry: {
                type: 'Point',
                coordinates: [geolocation.longitude, geolocation.latitude],
              },
              properties: {
                name: fakerator.names.name(),
                country:  fakerator.address.country(),
                city: fakerator.address.city(),
                street: fakerator.address.street(),
              },
            }
          })

          resolve(features)
        }, fakerator.random.number(1, 3) * 1000)
      })
    },
    clusterStyleFunc () {
      const cache = Object.create(null)

      return function __clusterStyleFunc (feature) {
        const size = feature.get('features').length
        let style = cache[size]

        if (!style) {
          style = createStyle({
            imageRadius: 10,
            strokeColor: '#6ff9ff',
            strokeWidth: 3,
            fillColor: '#00e676',
            text: size.toString(),
            textStrokeColor: '#222',
            textStrokeWidth: 2,
            textFillColor: '#fff',
            textOffsetX: -10,
            textOffsetY: -10,
          })
          cache[size] = style
        }
        return [style]
      }
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
        showMap: true,
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
        eventSourcedFeatures: [],
        layerExtent: [-10000000, -10000000, 10000000, 10000000],
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

      // this.requestNewFeatures()
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
    z-index    : 1;

    > button {
      margin         : 5px;
      padding        : 5px 10px;
      text-transform : uppercase;
    }
  }
</style>
