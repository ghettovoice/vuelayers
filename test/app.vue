<template>
  <div id="app">
    <div style="height: 100%">
      <div style="position: absolute; text-align: center; top: 0; left: 0; right: 0; z-index: 100">
        <button @click="graticule = !graticule">Graticule</button>
      </div>

      <vl-map v-if="showMap" ref="map" data-projection="EPSG:4326">
        <vl-view ref="view" ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation">
        </vl-view>

        <vl-graticule :show-labels="true" v-if="graticule">
          <vl-style-stroke slot="stroke" color="green" :line-dash="[5, 10]"></vl-style-stroke>
          <vl-style-text slot="lon" text-baseline="bottom">
            <vl-style-stroke color="blue"></vl-style-stroke>
          </vl-style-text>
          <vl-style-text slot="lat" text-align="end">
            <vl-style-stroke color="black"></vl-style-stroke>
          </vl-style-text>
        </vl-graticule>

        <vl-layer-tile id="sputnik">
          <vl-source-stamen layer="toner-lite"/>
        </vl-layer-tile>
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
  import ScaleLine from 'ol/control/ScaleLine'
  import GML from 'ol/format/GML2'
  import WFS from 'ol/format/WFS'

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
    formatFactory () {
      return new WFS({
        gmlFormat: new GML(),
      })
    },
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
        zoom: 5,
        center:  [-79.27368887216703, 43.64267516128234],
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
        gmlFeatures: [],
        graticule: false,
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
