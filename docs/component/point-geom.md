# vl-geom-point

> A single point.

`vl-geom-point` can be used inside a [`vl-feature`](/docs/component/feature.md) to draw a single points.

## ES6 Module

```javascript
import { PointGeom } from 'vuelayers'

Vue.use(PointGeom)
```

<vuep template="#point-geom-example"></vuep>

<script v-pre type="text/x-template" id="point-geom-example">
<template>
  <vl-map data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>

    <vl-feature>
      <vl-geom-point :coordinates="[38.726634,9.003391]"></vl-geom-point>
    </vl-feature>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return {
        zoom: 15,
        center: [38.7241,9.0048],
        rotation: 0,
      }
    },
  }
</script>
</script>

## Properties

### coordinates

- **Type**: `number[]`

This point's coordinates in units of the map's [`projection`](/docs/quickstart.md#global-data-projection).
