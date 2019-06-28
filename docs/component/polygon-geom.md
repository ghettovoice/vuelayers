# vl-geom-polygon

> A single polygon geometry.

`vl-geom-polygon` can be used inside a [`vl-feature`](/docs/component/feature.md) to draw a single polygon on the map. The polygon may contain holes in it, check the usage section for more info on this.

## ES6 Module

```javascript
import { PolygonGeom } from 'vuelayers'

Vue.use(PolygonGeom)
```

## Usage

A simple polygon.

<vuep template="#polygon-geom-example"></vuep>

<script v-pre type="text/x-template" id="polygon-geom-example">
<template>
  <vl-map data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>

    <vl-feature>
      <vl-geom-polygon :coordinates="[[[-98.844959,19.691586],[-98.842749,19.690980],[-98.842170,19.693122],[-98.844358,19.693667],[-98.844959,19.691586]]]"></vl-geom-polygon>
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

In the following example there is a polygon with a hole in it.

<vuep template="#polygon-with-hole-example"></vuep>

<script v-pre type="text/x-template" id="polygon-with-hole-example">
<template>
  <vl-map data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>

    <vl-feature>
      <vl-geom-polygon :coordinates="[[[-67.489700,-18.379940],[-67.467727,-18.463978],[-67.406616,-18.518678],[-67.318038,-18.568154],[-67.234954,-18.521283],[-67.233581,-18.425547],[-67.313919,-18.366907],[-67.422409,-18.344097],[-67.489700,-18.379940]],[[-67.405242,-18.403397],[-67.341384,-18.406654],[-67.294006,-18.445741],[-67.329025,-18.496540],[-67.379150,-18.470491],[-67.405242,-18.403397]]]"></vl-geom-polygon>
    </vl-feature>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return {
        zoom: 11,
        center: [-67.3675,-18.4601],
        rotation: 0,
      }
    },
  }
</script>
</script>

## Properties

### coordinates

- **Type**: `number[][][]`

A [polygon](https://tools.ietf.org/html/rfc7946#section-3.1.6) with coordinates in the map's [`projection`](/docs/quickstart.md#global-data-projection).
