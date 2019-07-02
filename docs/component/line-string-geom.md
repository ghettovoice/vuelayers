# vl-geom-line-string

> The single line geometry.

`vl-geom-line-string` can be used inside a [`vl-feature`](/docs/component/feature.md) to draw lines on the map.

## ES6 Module

```javascript
import { LineStringGeom } from 'vuelayers'

Vue.use(LineStringGeom)
```

<vuep template="#line-string-geom-example"></vuep>

<script v-pre type="text/x-template" id="line-string-geom-example">
<template>
  <vl-map data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>

    <vl-feature>
      <vl-geom-line-string :coordinates="[[116.544921,40.451633],[116.545264,40.451649],[116.545865,40.451698],[116.546144,40.451551],[116.546337,40.451274],[116.546788,40.451143],[116.547324,40.451078],[116.547539,40.450996],[116.547839,40.450719],[116.548440,40.450506],[116.548933,40.450604],[116.549448,40.450604],[116.550242,40.450376],[116.550865,40.450163],[116.551702,40.449935],[116.552581,40.449576]]"></vl-geom-line-string>
    </vl-feature>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return {
        zoom: 17,
        center: [116.54875,40.45064],
        rotation: 0,
      }
    },
  }
</script>
</script>

## Properties

### coordinates

- **Type**: `number[][]`

An array of pairs of coordinates as specified by the [geojson spec](https://tools.ietf.org/html/rfc7946#section-3.1.4) in units of the map's [`projection`](/docs/quickstart.md#global-data-projection).
