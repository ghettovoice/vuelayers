# vl-style-circle

> Styles points as circles.

Use it inside [`vl-style-box`](/docs/component/style-box.md) to style points as circles.

## ES6 Module

```javascript
import { CircleStyle } from 'vuelayers'

Vue.use(CircleStyle)
```

## Usage

Styling a feature inside a vector layer.

<vuep template="#circle-style-feature"></vuep>

<script v-pre type="text/x-template" id="circle-style-feature">
<template>
  <div>
    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

      <vl-layer-tile>
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-feature>
          <vl-geom-point
            :coordinates="[12.492442,41.890170]" 
          ></vl-geom-point>

          <vl-style-box>
            <vl-style-circle :radius="20">
              <vl-style-fill color="white"></vl-style-fill>
              <vl-style-stroke color="red"></vl-style-stroke>
            </vl-style-circle>
          </vl-style-box>
        </vl-feature>
      </vl-layer-vector>
    </vl-map>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        zoom: 15,
        center: [12.492442,41.890170],
        rotation: 0,
      }
    },
  }
</script>
</script>

Styling the whole layer

<vuep template="#circle-style-layer"></vuep>

<script v-pre type="text/x-template" id="circle-style-layer">
<template>
  <div>
    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

      <vl-layer-tile>
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-source-vector :features="points"></vl-source-vector>

        <vl-style-box>
          <vl-style-circle :radius="20">
            <vl-style-fill color="white"></vl-style-fill>
            <vl-style-stroke color="red"></vl-style-stroke>
          </vl-style-circle>
        </vl-style-box>
      </vl-layer-vector>
    </vl-map>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        zoom: 15,
        center: [12.492442,41.890170],
        rotation: 0,
        points: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [12.492442,41.890170],
            },
            properties: {},
          }
        ],
      }
    },
  }
</script>
</script>

## Properties

### radius

- **Type**: `number`

Radius in pixels of the circle.
