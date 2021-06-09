<template>
  <div id="app">
    <vl-map
      ref="map"
      :default-interactions="interactionOptions"
      data-projection="EPSG:4326"
      @created="mapCreated">
      <vl-view
        :zoom.sync="zoom"
        :center.sync="center" />
      <vl-layer-tile>
        <vl-source-osm />
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-source-vector :features="savedFeatures" />
      </vl-layer-vector>

      <vl-interaction-select :features.sync="selectedFeatures" />
    </vl-map>
  </div>
</template>

<script>
  import { random, range } from 'lodash'
  import { OverviewMap } from 'ol/control'

  export default {
    name: 'App',
    data: function () {
      return {
        zoom: 1,
        center: [0, 0],
        extent: null,
        features: [],
        selectedFeatures: [],
        savedFeatures: range(0, 100).map(i => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              random(-50, 50),
              random(-50, 50),
            ],
          },
        })),
        url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
        interactionOptions: {
          dragPan: true,
          shiftDragZoom: true,
          mouseWheelZoom: true,
          pinchZoom: true,
        },
        mapLock: false,
      }
    },
    watch: {
      mapLock () {
        this.lockToggle()
      },
    },
    methods: {
      mapCreated (vm) {
        vm.$map.addControl(new OverviewMap())
      },
      lockToggle () {
        this.interactionOptions.dragPan = !this.interactionOptions.dragPan
        this.interactionOptions.shiftDragZoom = !this.interactionOptions.shiftDragZoom
        this.interactionOptions.mouseWheelZoom = !this.interactionOptions.mouseWheelZoom
        this.interactionOptions.pinchZoom = !this.interactionOptions.pinchZoom
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
