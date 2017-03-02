<template>
  <div id="app">
    <vl-map>
      <vl-map-view @change="viewChanged"/>
      <vl-geoloc/>

      <vl-interaction-select/>

      <vl-layer-tile>
        <vl-source-osm/>
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-style-container>
          <vl-style-stroke color="#13A838" :width="stroke"/>
          <vl-style-fill :color="color"/>

          <vl-style-circle :radius="10">
            <vl-style-stroke color="#13A838" :width="stroke"/>
            <vl-style-fill :color="color"/>
          </vl-style-circle>
        </vl-style-container>

        <vl-source-vector>
          <vl-feature v-for="feature in features" :key="feature.id" :id="feature.id" :data="feature.data">
            <!--<vl-style-container v-if="zoom > 2">-->
              <!--<vl-style-stroke color="#13A838" :width="stroke"/>-->
              <!--<vl-style-fill :color="color"/>-->
              <!--<vl-style-circle :radius="20">-->
                <!--<vl-style-stroke color="#13A838" :width="stroke"/>-->
                <!--<vl-style-fill :color="color"/>-->
              <!--</vl-style-circle>-->
            <!--</vl-style-container>-->

            <!--<vl-style-container v-if="zoom <= 2">-->
              <!--<vl-style-stroke color="#13A838" :width="4"/>-->
              <!--<vl-style-fill :color="feature.data.color"/>-->
              <!--<vl-style-circle :radius="10">-->
                <!--<vl-style-stroke color="#13A838" :width="4"/>-->
                <!--<vl-style-fill :color="feature.data.color"/>-->
              <!--</vl-style-circle>-->
            <!--</vl-style-container>-->

            <component :is="feature.geometry.type" :coordinates="feature.geometry.coordinates"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
    </vl-map>

    <div style="position: absolute; top: 10px; right: 10px">
      <button
        @click="color = [Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 100), Math.random()]">
        Change color
      </button>
      <button @click="stroke = Math.ceil(Math.random() * 10)">Change stroke</button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'app',
    methods: {
      viewChanged ({ zoom }) {
        this.zoom = zoom
      }
    },
    data () {
      return {
        zoom: 0,
        color: [ 255, 255, 255, 0.5 ],
        stroke: 2,
        features: [
          {
            id: 1,
            data: {
              color: [ 123, 56, 255, 0.8 ]
            },
            geometry: {
              type: 'vl-geom-polygon',
              coordinates: [ [ [ 10, 10 ], [ 10, 70 ], [ 70, 10 ], [ 10, 10 ] ] ]
            }
          },
          {
            id: 2,
            data: {
              color: '#111671'
            },
            geometry: {
              type: 'vl-geom-polygon',
              coordinates: [ [ [ -10, 10 ], [ -20, 70 ], [ -70, 10 ], [ -10, 10 ] ] ]
            }
          },
          {
            id: 3,
            data: {
              color: 'rgba(33, 66, 99, 0.3)'
            },
            geometry: {
              type: 'vl-geom-multi-point',
              coordinates: [ [ -50, -50 ], [ -45, -45 ] ]
            }
          }
        ]
      }
    }
  }
</script>

<style lang="scss">
  @import "~openlayers/dist/ol";

  html, body, #app {
    width  : 100%;
    height : 100%;
    margin : 0;
  }
</style>
