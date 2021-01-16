<template>
  <div id="app">
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value (default)</th>
          <th>Value (instant)</th>
          <th>Persisted</th>
          <th>Control</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>Projection</code></td>
          <td>
            <output>EPSG:3413</output>
          </td>
          <td>
            <output>{{ projection }}</output>
          </td>
          <td>False</td>
          <td>
            <select v-model="projection">
              <option value="EPSG:3031">
                WGS84 Antarctic Polar Stereographic
              </option>
              <option value="EPSG:3413">
                WGS84 NSIDC Sea Ice Polar Stereographic North
              </option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <hr />
    <VlMap
      ref="AppMap"
      :data-projection="projection"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true">
      <VlView
        ref="AppMapView"
        :zoom.sync="zoom"
        :projection="projection"
        :center.sync="centre" />
      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>
    </VlMap>
  </div>
</template>

<script>
  import { get as getProj, transformExtent } from 'ol/proj'
  import { register } from 'ol/proj/proj4'
  import proj4 from 'proj4'

  proj4.defs(
    'EPSG:3413',
    '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
  )
  proj4.defs(
    'EPSG:3031',
    '+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
  )
  register(proj4)

  const proj3031 = getProj('EPSG:3031')
  const proj3031bbox = [-60, -180, -90, 180]
  let proj3031extent = [proj3031bbox[1], proj3031bbox[2], proj3031bbox[3], proj3031bbox[0]]
  proj3031.setWorldExtent(proj3031extent)

  if (proj3031bbox[1] > proj3031bbox[3]) {
    proj3031extent = [proj3031bbox[1], proj3031bbox[2], proj3031bbox[3] + 360, proj3031bbox[0]]
  }
  proj3031.setExtent(transformExtent(proj3031extent, 'EPSG:4326', 'EPSG:3031', 8))

  const proj3413 = getProj('EPSG:3413')
  const proj3413bbox = [90, -180, 60, 180]
  let proj3413extent = [proj3413bbox[1], proj3413bbox[2], proj3413bbox[3], proj3413bbox[0]]
  proj3413.setWorldExtent(proj3413extent)

  if (proj3413bbox[1] > proj3413bbox[3]) {
    proj3413extent = [proj3413bbox[1], proj3413bbox[2], proj3413bbox[3] + 360, proj3413bbox[0]]
  }
  proj3413.setExtent(transformExtent(proj3413extent, 'EPSG:4326', 'EPSG:3413', 8))

  export default {
    name: 'App',

    data: function () {
      return {
        zoom: 1,
        centre: [0, 0],
        projection: 'EPSG:3031',
      }
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
