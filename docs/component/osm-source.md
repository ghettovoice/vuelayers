# vl-source-osm

> Source layer ready to load OpenStreetMaps tiles

`vl-source-osm` is a convenience layer built on top of [vl-source-xyz](/docs/component/xyz-source.md) ready to load tiles from OpenStreetMaps.

## ES6 Module

```javascript
import { OsmSource } from 'vuelayers'

Vue.use(OsmSource)
```

## Usage

Loading a simple OSM base layer.

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile id="osm">
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return {
        zoom: 2,
        center: [0, 0],
        rotation: 0,
      }
    },
  }
</script>
</script>

## Properties

### attributions

- **Type**: `string, array`
- **Default**: `&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.`

### max-zoom

- **Type**: `number`
- **Default**: `19`

### url

- **Type**: `string`
- **Default**: `https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png`
