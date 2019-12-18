# vl-interaction-draw

> Interaction for drawing feature geometries.

`vl-interaction-draw` handles click events on the map and makes easier to draw geometries.

## ES6 Module

```javascript
import { DrawInteraction } from 'vuelayers'

Vue.use(DrawInteraction)
```

## Usage

<vuep template="#interaction-draw"></vuep>

<script v-pre type="text/x-template" id="interaction-draw">
<template>
  <vl-map style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center"></vl-view>

    <vl-layer-vector z-index="1">
      <vl-source-vector :features.sync="features" ident="the-source"></vl-source-vector>

      <vl-style-box>
        <vl-style-stroke color="green"></vl-style-stroke>
        <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
      </vl-style-box>
    </vl-layer-vector>

    <vl-interaction-draw type="Polygon" source="the-source">
      <vl-style-box>
        <vl-style-stroke color="blue"></vl-style-stroke>
        <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
      </vl-style-box>
    </vl-interaction-draw>

    <vl-layer-tile z-index="0">
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
        features: [],
      }
    },
  }
</script>
</script>

## Properties

### source

- **Type**: `string`
- **Required**: `true`

Target source or collection. Must be registered via the `ident` attribute (see usage).

### type

- **Type**: `string`
- **Required**: `true`

Drawing type (`Point`, `LineString`, `Polygon`, `MultiPoint`, `MultiLineString`, `MultiPolygon` or `Circle`).

### active

- **Type**: `boolean`
- **Default**: `true`

### priority
- **Type**: `number`
- **Default**: `0`

Priority of interactions in the event handling stream. The higher the value, the sooner it will handle map event.

### click-tolerance

- **Type**: `number`
- **Default**: `6`

The maximum distance in pixels between "down" and "up" for a "up" event to be considered a "click" event and actually add a point/vertex to the geometry being drawn. Default is 6 pixels. That value was chosen for the draw interaction to behave correctly on mouse as well as on touch devices.

### snap-tolerance

- **Type**: `number`
- **Default**: `12`

Pixel distance for snapping to the drawing finish.

### stop-click

- **Type**: `boolean`
- **Default**: `false`

Stop click, singleclick, and doubleclick events from firing during drawing.

### max-points

- **Type**: `number`

The number of points that can be drawn before a polygon ring or line string is finished.

### min-points

- **Type**: `number`

The number of points that must be drawn before a polygon ring or line string can be finished. Default is `3` for polygon rings and `2` for line strings.

### finish-condition

- **Type**: `function`

A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether the drawing can be finished.

### geometry-function

- **Type**: `function`

Function that is called when a geometry's coordinates are updated.

### geometry-name

- **Type**: `string`
- **Default**: `geometry`

Name of the geometry attribute for newly created features.

### condition

- **Type**: `function`
- **Default**: `noModifierKeys`

A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should be handled. By default `ol.events.condition.noModifierKeys`, i.e. a click, adds a vertex or deactivates freehand drawing.

### freehand

- **Type**: `boolean`
- **Default**: `false`

Operate in freehand mode for lines, polygons, and circles. This makes the interaction always operate in freehand mode and takes precedence over any `freehandCondition` option.

### freehand-condition

- **Type**: `function`
- **Default**: `shiftKeyOnly`

Condition that activates freehand drawing for lines and polygons. This function takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should be handled. The default is `ol.events.condition.shiftKeyOnly`, meaning that the Shift key activates freehand drawing.

### wrap-x

- **Type**: `boolean`
- **Default**: `false`

Wrap the world horizontally on the sketch overlay.

## Events

- `drawstart`
- `drawend`
