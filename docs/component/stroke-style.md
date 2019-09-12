# vl-style-stroke

> Style the stroke of a line or polygon.

Use it inside [`vl-style-box`](/docs/component/style-box.md) to style lines and polygons or inside [`vl-style-circle`](/docs/component/circle-style.md) to style circles.

## ES6 Module

```javascript
import { StrokeStyle } from 'vuelayers'

Vue.use(StrokeStyle)
```

## Usage

<vuep template="#stroke-style-example"></vuep>

<script v-pre type="text/x-template" id="stroke-style-example">
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
          <vl-style-stroke
            color="red"
            :width="3"
            :line-dash="[3, 5, 30, 5]"
          ></vl-style-stroke>
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

### Color

- **Type**: `array`, `string`

Stroke color. Either in hexadecimal or as RGBA array with red, green, and blue values betweeen 0 and 255 and alpha value between 0 and 1 inclusive.

### lineCap

- **Type**: `string`
- **Default**: `round`,

How to style the ends of the lines if any. Options are `round`, `butt`, and `square`.

### lineJoin

- **Type**: `string`
- **Default**: `round`,

How to style line segment joints. Choices are  `round`, `bevel`, `miter`

### lineDash

- **Type**: `array`

An Array of numbers that specify distances to alternately draw a line and a gap.

### lineDashOffset

- **Type**: `number`
- **Default**: `0`

Offsets the starting point of the dash pattern by the given amount.

### miterLimit

- **Type**: `number`
- **Default**: `10`

When to cut corners on sharp angles. For reference check [this entry](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit) on Mozilla Developer Network.

### Width

- **Type**: `Number`
- **Default**: `1.25`

Width of the stroke.
