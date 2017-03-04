<template>
  <div id="app">
    <vl-map>
      <vl-map-view :zoom="2" @change="viewChanged"/>
      <vl-geoloc/>

      <vl-interaction-select ref="select" :selected="selected" @select="select" @unselect="unselect">
        <vl-style-container>
          <vl-style-stroke color="#D421E5"/>
          <vl-style-fill color="#E5BC15"/>

          <vl-style-circle :radius="15">
            <vl-style-stroke color="#D421E5"/>
            <vl-style-fill color="#E5BC15"/>
          </vl-style-circle>

        </vl-style-container>
      </vl-interaction-select>

      <vl-layer-tile id="osm">
        <vl-source-osm/>
      </vl-layer-tile>

      <vl-layer-vector id="vector">
        <vl-style-container>
          <vl-style-stroke color="#13A838" :width="20"/>
          <vl-style-fill :color="color"/>

          <vl-style-circle :radius="10">
            <vl-style-stroke color="#13A838" :width="20"/>
            <vl-style-fill :color="color"/>
          </vl-style-circle>
        </vl-style-container>

        <vl-style-container>
          <vl-style-stroke color="#787878" :width="stroke"/>

          <vl-style-circle :radius="10">
            <vl-style-stroke color="#787878" :width="stroke"/>
          </vl-style-circle>
        </vl-style-container>

        <vl-source-vector>
          <vl-feature v-for="feature in features" :key="feature.id" :id="feature.id" :data="feature.data">
            <component :is="feature.geometry.type" :coordinates="feature.geometry.coordinates"/>

            <vl-style-container v-if="selected.includes(feature.id)">
              <vl-style-stroke color="#E514A7" :width="5"/>
              <vl-style-fill :color="feature.data && feature.data.color || '#E50E00'"/>

              <vl-style-circle :radius="10">
                <vl-style-stroke color="feature.data && feature.data.color || '#E50E00'" :width="5"/>
                <vl-style-fill :color="color"/>
              </vl-style-circle>
            </vl-style-container>
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
      <button @click="toggleSelect(1)">Toggle 1</button>
      <button @click="toggleSelect(2)">Toggle 2</button>
      <button @click="toggleSelect(3)">Toggle 3</button>
    </div>
  </div>
</template>

<script>
  import ol from 'openlayers'
  import { style as olStyleHelper } from '../src/ol'

  export default {
    name: 'app',
    methods: {
      viewChanged ({ zoom }) {
        this.zoom = zoom
      },
      toggleSelect (id) {
        const idx = this.selected.indexOf(id)
        if (idx === -1) {
          this.select(id)
        } else {
          this.unselect(id)
        }
      },
      select (id) {
        if (this.selected.indexOf(id) === -1) {
          this.selected.push(id)
        }
      },
      unselect (id) {
        let idx = this.selected.indexOf(id)
        if (idx !== -1) this.selected.splice(idx, 1)
      },
      styleFunction () {
        const style = olStyleHelper.transformStyle({
          strokeWidth: 5,
          strokeColor: '#E514A7',
          fillColor: '#E50E00',
          iconRadius: 10
        })

        return (feature, resolution) => {
          if (feature.$vm.data.color == null) return [ style ]

          return [
            new ol.style.Style({
              stroke: style.stroke,
              fill: olStyleHelper.transformFillStyle({
                fillColor: feature.$vm.data.color
              }),
              image: olStyleHelper.transformImageStyle({
                strokeWidth: 5,
                strokeColor: '#E514A7',
                fillColor: feature.$vm.data.color,
                iconRadius: 10
              })
            })
          ]
        }
      },
      notSelected (feature) {
        return !this.selected.includes(feature.id)
      }
    },
    data () {
      return {
        zoom: 0,
        color: [ 255, 255, 255, 0.5 ],
        stroke: 2,
        selected: [],
        features: [
          {
            id: 1,
            data: {
              color: [ 123, 56, 255, 0.8 ]
            },
            geometry: {
              type: 'vl-geom-polygon',
              coordinates: [ [ [ 0, 50 ], [ 10, 70 ], [ 70, 10 ], [ 10, 10 ] ] ]
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
//              color: 'rgba(33, 66, 99, 0.3)'
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
