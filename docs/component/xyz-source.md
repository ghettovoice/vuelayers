# vl-source-xyz

> Layer source for tile data with URLs in a set XYZ format that are defined in a URL template.

`vl-source-xyz` allows you to use any tiled source from OpenStreetMaps to google maps.

## ES6 Module

```javascript
import { XyzSource } from 'vuelayers'

Vue.use(XyzSource)
```

## Usage

Example of `vl-source-xyz` loading OSM tiles (Note that if you need an OSM layer you're better off using [vl-source-osm](/docs/component/osm-source.md), this is for demonstration purposes only).

<vuep template="#osm-tiles"></vuep>

<script v-pre type="text/x-template" id="osm-tiles">
<template>
  <vl-map data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center"></vl-view>

    <vl-layer-tile>
      <vl-source-xyz :url="url"></vl-source-xyz>
    </vl-layer-tile>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return { 
        zoom: 2,
        center: [0, 0],
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      }
    },
  }
</script>
</script>

Example of loading google maps satellite tiles. Notice that this is only allowed in places that are publicly available to the internet (as opposed to being behind a password for example).

<vuep template="#google-tiles"></vuep>

<script v-pre type="text/x-template" id="google-tiles">
<template>
  <vl-map data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center"></vl-view>

    <vl-layer-tile>
      <vl-source-xyz
        attributions='<a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>'
        url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
      >
      </vl-source-xyz>
    </vl-layer-tile>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return { 
        zoom: 2,
        center: [0, 0],
      }
    },
  }
</script>
</script>

## Properties

### cache-size

- **Type**: `number`
- **Default**: `2048`

### cross-origin

- **Type**: `string`

### max-zoom

- **Type**: `number`
- **Default**: `28`

### min-zoom

- **Type**: `number`
- **Default**: `0`

### opaque

- **Type**: `boolean`

### projection

- **Type**: `string`
- **Default**: `EPSG:3857`

### reprojection-error-threshold

- **Type**: `number`
- **Default**: `0.5`

### tile-pixel-ratio

- **Type**: `number`
- **Default**: `1`

### tile-size

- **Type**: `array`
- **Default**: `[256, 256]`

### tile-load-function

- **Type**: `function`

### tile-key

- **Type**: `string`

### url

- **Type**: `string, function`
- **Required**: `true`

URL template or custom tile URL function.

### transition

- **Type**: `number`

Duration of the opacity transition for rendering. To disable the opacity transition, pass `0`.
