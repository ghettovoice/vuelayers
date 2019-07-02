# vl-geom-circle

> The circle geometry.

`vl-geom-circle` can be used in a [`vl-feature`](/docs/component/feature.md) to draw circles on the map.

## ES6 Module

```javascript
import { CircleGeom } from 'vuelayers'

Vue.use(CircleGeom);
```

## Usage

<vuep template="#circle-geom-example"></vuep>

<script v-pre type="text/x-template" id="circle-geom-example">
<template>
  <vl-map data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>

    <vl-feature>
      <vl-geom-circle :coordinates="[12.492442,41.890170]" :radius="100"></vl-geom-circle>
    </vl-feature>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return {
        zoom: 17,
        center: [12.4909725,41.8907348],
        rotation: 0,
      }
    },
  }
</script>
</script>

## Properties

### coordinates

- **Type**: `number[]`
- **Default**: `[0, 0]`

The center coordinate of the circle in the unit specified by the view's [`projection`](/docs/quickstart.md#global-data-projection).

### radius

- **Type**: `number`
- **Default**: `0`

The radius of the circle in the unit specified by the view's [`projection`](/docs/quickstart.md#global-data-projection).
