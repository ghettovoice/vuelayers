<template>
  <div id="app">
    <div style="height: 50%">
      <vl-map>
        <vl-view ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

        <vl-interaction-select @select="select" @unselect="unselect" :features.sync="selected"></vl-interaction-select>

        <vl-layer-tile id="sputnik">
          <vl-source-sputnik/>
        </vl-layer-tile>

        <vl-layer-vector id="points" v-if="pointsLayer">
          <!--<vl-source-cluster>-->
            <vl-source-vector :features="points"/>
          <!--</vl-source-cluster>-->
        </vl-layer-vector>

        <vl-layer-tile id="wmts">
          <vl-source-wmts
            url="https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/"
            layer-name="0" matrix-set="EPSG:3857" format="image/png" style-name="default"/>
        </vl-layer-tile>

        <vl-layer-vector>
          <vl-source-vector>
            <vl-feature :id="polyId" ref="poly">
              <vl-geom-polygon :coordinates.sync="polygonCoords" />
            </vl-feature>
          </vl-source-vector>
        </vl-layer-vector>
      </vl-map>
    </div>
    <!--<div style="height: 50%">
      <vl-map>
        <vl-view ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

        <vl-layer-tile>
          <vl-source-sputnik/>
        </vl-layer-tile>

        <vl-layer-tile id="wms">
          <vl-source-wms url="https://ahocevar.com/geoserver/wms" layers="topp:states"
                         :ext-params="{ TILED: true }" server-type="geoserver"/>
        </vl-layer-tile>

        <vl-layer-vector>
          &lt;!&ndash;<vl-source-cluster>&ndash;&gt;
          <vl-source-vector>
            <vl-feature>
              <vl-geom-polygon :coordinates.sync="polygonCoords" />
            </vl-feature>
          </vl-source-vector>
          &lt;!&ndash;</vl-source-cluster>&ndash;&gt;
        </vl-layer-vector>
      </vl-map>
    </div>-->
  </div>
</template>

<script>
  import { range, random } from 'lodash/fp'

  const methods = {
    select (feature) {
      console.log('select', feature)
    },
    unselect (feature) {
      console.log('unselect', feature)
    },
    loadData () {
      const points = []
      range(1, 100).forEach(i => {
        points.push({
          type: 'Feature',
          id: i,
          properties: {
            id: i
          },
          geometry: {
            type: 'Point',
            coordinates: [
              random(-179, 179),
              random(-89, 89)
            ]
          }
        })
      })

      this.points = points

      return Promise.resolve(this.points)
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
        points: [],
        pointsLayer: true,
        polyId: '123',
        polygonCoords: [[[0, 0], [10, 10], [10, 0], [0, 0]]],
        selected: [10, 20, 30]
      }
    },
    mounted () {
      this.loadData()
    }
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
