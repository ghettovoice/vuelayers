# vl-geom-multi-polygon

> The multiple polygon geometry.

`vl-geom-multi-polygon` can be used inside a [`vl-feature`](/docs/component/feature.md) to draw multiple polygons at once on the map.

## ES6 Module

```javascript
import { MultiPolygonGeom } from 'vuelayers'

Vue.use(MultiPolygonGeom)
```

<vuep template="#multi-polygon-geom-example"></vuep>

<script v-pre type="text/x-template" id="multi-polygon-geom-example">
<template>
  <vl-map data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>

    <vl-feature>
      <vl-geom-multi-polygon :coordinates="[[[[-98.844959,19.691586],[-98.842749,19.690980],[-98.842170,19.693122],[-98.844358,19.693667],[-98.844959,19.691586]]],[[[-98.847770,19.684212],[-98.849079,19.680596],[-98.845453,19.679585],[-98.844466,19.683384],[-98.847770,19.684212]]]]"></vl-geom-multi-polygon>
    </vl-feature>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return {
        zoom: 15,
        center: [-98.8449,19.6869],
        rotation: 0,
      }
    },
  }
</script>
</script>

## Properties

### coordinates

- **Type**: `number[][][][]`

An array of [polygons](https://geojson.org/geojson-spec.html#polygon) with coordinates in the map's [`projection`](/docs/quickstart.md#global-data-projection).
