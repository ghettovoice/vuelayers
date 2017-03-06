<template>
  <div id="app">
    <vl-map>
      <vl-map-view :center="center" :zoom="zoom" :rotation="rotation" @change="updateMapView"/>
      <vl-geoloc @change="updateGeoloc"/>

      <!-- interactions -->
      <vl-interaction-select ref="select" :selected="selected" @select="select" @unselect="unselect">
        <vl-style-container>
          <vl-style-stroke color="#f03b20" :width="3"/>
          <vl-style-fill :color="[254, 178, 76, 0.7]"/>
        </vl-style-container>
      </vl-interaction-select>
      <!--// interactions -->

      <vl-layer-tile id="mapbox" :visible="layers.mapbox">
        <vl-source-mapbox map-id="ghettovoice.nbm2olb0"
                          access-token="pk.eyJ1IjoiZ2hldHRvdm9pY2UiLCJhIjoiMzMxYzMyMWQ3NTgzMTU4Nzk3ZTNmMmI3MmQ1NmVhMjgifQ._erAEzdvdB0jfYXXqzOJCg"/>
      </vl-layer-tile>
      <!--// base layers -->

      <!-- pacman, use v-style-func for advanced styling -->
      <vl-layer-vector id="pacman" v-if="pacman.length" v-style-func="pacmanStyleFunc" :visible="layers.pacman">
        <vl-source-vector>
          <vl-feature v-for="feature in pacman" :key="feature.id" :id="feature.id" :data="feature.properties">
            <component :is="geometryTypeToCompName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
      <!--// pacman -->

      <!-- position -->
      <vl-layer-vector v-if="position.length" id="my-position" :z-index="100">
        <vl-style-container>
          <vl-style-icon src="/static/img/marker.png" :scale="0.3" :anchor="[0.5, 1]"/>
        </vl-style-container>

        <vl-source-vector>
          <vl-feature id="my-position">
            <vl-geom-point :coordinates="position"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
      <!--// position -->
    </vl-map>

    <div class="controls">
      <button v-for="layer in ['mapbox', 'pacman']" :key="layer" @click="toggleLayer(layer)">
        Toggle layer {{ layer }}
      </button>
    </div>
  </div>
</template>

<script>
  import { kebabCase } from 'lodash/fp'

  const methods = {
    geometryTypeToCompName (type) {
      return 'vl-geom-' + kebabCase(type)
    },
    updateMapView ({ center, zoom, rotation }) {
      this.center = center
      this.zoom = zoom
      this.rotation = rotation
    },
    updateGeoloc ({ position }) {
      this.position = position
    },
    select (id) {
      if (this.selected.indexOf(id) === -1) {
        this.selected.push(id)
      }
    },
    unselect (id) {
      const i = this.selected.indexOf(id)
      if (i !== -1) {
        this.selected.splice(i, 1)
      }
    },
    pacmanStyleFunc (ol, styleHelper) {
      const pacman = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#DE9147',
            width: 3
          }),
          fill: new ol.style.Fill({
            color: [ 222, 189, 36, 0.8 ]
          })
        })
      ]
      const path = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'blue',
            width: 1
          })
        }),
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
              color: 'orange'
            })
          }),
          geometry (feature) {
            return new ol.geom.MultiPoint(feature.getGeometry().getCoordinates())
          }
        })
      ]
      const eye = [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
              color: '#444444'
            })
          })
        })
      ]

      return function __pacmanStyleFunc (feature, resolution) {
        switch (feature.getId()) {
          case 'pacman':
            return pacman
          case 'pacman-path':
            return path
          case 'pacman-eye':
            return eye
        }
      }
    },
    toggleLayer (layer) {
      this.layers[ layer ] = !this.layers[ layer ]
    }
  }

  export default {
    name: 'app',
    methods,
    data () {
      return {
        zoom: 2,
        center: [ 0, 0 ],
        rotation: 0,
        selected: [],
        pacman: require('../static/pacman.geojson').features,
        position: [],
        layers: {
          mapbox: true,
          pacman: false
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
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
      text-transform : uppercase;
    }
  }
</style>
