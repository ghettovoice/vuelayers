# vl-style-text

## ES6 Module

```javascript
import { TextStyle } from 'vuelayers'

Vue.use(TextStyle)
```

## Usage

Add text to shapes

<vuep template="#fill-style-feature"></vuep>

<script v-pre type="text/x-template" id="fill-style-feature">
<template>
  <div>
    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

      <vl-layer-tile>
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>

      <vl-layer-vector>
        <vl-source-vector :features="features"></vl-source-vector>

        <vl-style-box>
          <vl-style-fill color="white"></vl-style-fill>
          <vl-style-stroke color="red"></vl-style-stroke>
          <vl-style-text text="Hola" font="14px monospace"></vl-style-text>
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
        features: [
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    12.483816146850586,
                    41.88866861985328
                  ],
                  [
                    12.488279342651365,
                    41.886687809812926
                  ],
                  [
                    12.489266395568846,
                    41.89032989704626
                  ],
                  [
                    12.485275268554686,
                    41.89109662579462
                  ],
                  [
                    12.483816146850586,
                    41.88866861985328
                  ]
                ]
              ]
            }
          },
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    12.491540908813477,
                    41.89288562375104
                  ],
                  [
                    12.492055892944336,
                    41.889307577732616
                  ],
                  [
                    12.495832443237305,
                    41.8896909493925
                  ],
                  [
                    12.495746612548828,
                    41.89282173182968
                  ],
                  [
                    12.49445915222168,
                    41.8946745716015
                  ],
                  [
                    12.491540908813477,
                    41.89288562375104
                  ]
                ]
              ]
            }
          }
        ],
      }
    },
  }
</script>
</script>

## Properties

### font

- **Type**: `string`
- **Default**: `10px sans-serif`

CSS font format https://developer.mozilla.org/en-US/docs/Web/CSS/font?v=control

### placement

- **Type**: `string`

### offsetX

- **Type**: `number`
- **Default**: `0`

### offsetY

- **Type**: `number`
- **Default**: `0`

### rotateWithView

- **Type**: `boolean`
- **Default**: `false`

### rotation

- **Type**: `number`
- **Default**: `0`

### scale

- **Type**: `number`
- **Default**: `1`

### text

- **Type**: `string`
- **Required**: `true`

### textAlign

- **Type**: `string`

Can be `left`, `right`, `center`, `end`, `start`

### textBaseline

- **Type**: `string`

Can be `bottom`, `top`, `middle`, `alphabetic`, `hanging`, `ideographic`
