<template>
  <div id="app">
    <vl-map>
      <vl-map-view :center="center" :zoom="zoom" :rotation="rotation" @change="updateMapView"/>

      <!-- interactions -->
      <vl-interaction-select ref="select" :selected="selected" @select="select" @unselect="unselect">
        <vl-style-container>
          <vl-style-stroke color="#f03b20" :width="3"/>
          <vl-style-fill :color="[254, 178, 76, 0.7]"/>
        </vl-style-container>
      </vl-interaction-select>
      <!--// interactions -->

      <vl-layer-tile id="mapbox">
        <vl-source-mapbox map-id="ghettovoice.nbm2olb0"
                          access-token="pk.eyJ1IjoiZ2hldHRvdm9pY2UiLCJhIjoiMzMxYzMyMWQ3NTgzMTU4Nzk3ZTNmMmI3MmQ1NmVhMjgifQ._erAEzdvdB0jfYXXqzOJCg"/>
      </vl-layer-tile>
      <!--// base layers -->

      <vl-layer-vector id="countries">
        <!-- layer level style -->
        <vl-style-container>
          <vl-style-stroke color="#8856a7" :width="2"/>
          <vl-style-fill :color="[158, 188, 218, 0.5]"/>
        </vl-style-container>
        <!--// layer level style -->

        <vl-source-vector>
          <vl-feature v-for="feature in countries" :key="feature.id" :id="feature.id" :data="feature.properties">
            <component :is="geometryTypeToCompName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>
    </vl-map>
  </div>
</template>

<script>
  import { kebabCase } from 'lodash/fp'

  const computed = {
    selectedIds () {
      return this.selected.map(feature => feature.id)
    }
  }

  const methods = {
    geometryTypeToCompName (type) {
      return 'vl-geom-' + kebabCase(type)
    },
    updateMapView ({ center, zoom, rotation }) {
      this.center = center
      this.zoom = zoom
      this.rotation = rotation
    },
    select (plainFeature) {
      const i = this.selectedIds.indexOf(plainFeature.id)
      if (i === -1) {
        this.selected.push(plainFeature)
      }
    },
    unselect ({ id }) {
      const i = this.selectedIds.indexOf(id)
      if (i !== -1) {
        this.selected.splice(i, 1)
      }
    },
    async loadData () {
      const res = await fetch('https://openlayers.org/en/latest/examples/data/geojson/countries.geojson')
      const geomCollection = await res.json()
      this.countries = geomCollection.features// .filter(x => x.id === 'RUS')

//      return this.countries
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this.countries)
        }, 3000)
      })
    }
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
        selected: [],
        countries: []
      }
    },
    created () {
      this.loadData()
        .catch(::console.error)
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
</style>
