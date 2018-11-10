# vl-overlay

> HTML element attached to geographical coordinate

`vl-overlay` component creates a HTML element that would be displayed over 
the map. It has **default** scoped slot to render your custom content. You can
place it any component with slot inside the map components tree to easily bind
it to some coordinate (for example: inside `vl-feature` or `vl-view`).

## Versions

`vl-overlay` component is a part of **Overlay** module:

- **ES6**: https://unpkg.com/vuelayers/lib/overlay/

## Usage

Example below shows how to add custom content on to the map.

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile id="osm">
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>

    <vl-overlay id="overlay" :position="overlayCoordinate">
      <template slot-scope="scope">
        <div class="overlay-content">
          Hello world!<br>
          Position: {{ scope.position }}
        </div>
      </template>
    </vl-overlay>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return { 
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        overlayCoordinate: [30, 30],
      }
    },
  }
</script>
</script>

### Properties

### position

- **Type**: `number[]`
- **Required**

Coordinate of the overlay position in view [`projection`](/docs/component/view.md#projection) or 
[data projection](/docs/quickstart.md#global-data-projection).

### id

- **Type**: `string | number`
- **Default**: `uuid.v4()` 

Unique identifier of the overlay.

### offset

- **Type**: `number[]`
- **Default**: `[0, 0]`

XY axis offset in pixels used when positioning the overlay.

### positioning

- **Type**: `string`
- **Default**: `top-left`

The overlay positioning relative to its [`position`](#position).  Possible values: `bottom-left`, 
`bottom-center`, `bottom-right`, `center-left`, `center-center`, `center-right`, `top-left`, `top-center`, 
and `top-right`.

### stop-event

- **Type**: `boolean`
- **Default**: `true`

Whether pointer event propagation from overlay element to the map viewport should be stopped. When set to `true`
the overlay will be placed in the same container with map controls.

### insert-first

- **Type**: `boolean`
- **Default**: `true`

Determines whether the overlay will be prepended or appended in the overlay container. 
When [`stop-event`](#stop-event) is set to `true` you will probably set `insert-first` to `true` 
so the overlay is displayed below controls.  

### auto-pan

- **Type**: `boolean`
- **Default**: `false`

Enables map panning when the overlay will be added, so the overlay will be visible in the current viewport.

### auto-pan-margin

- **Type**: `boolean`
- **Default**: `20`

The margin (in pixels) between the overlay and the viewport borders.

### auto-pan-animation

- **Type**: `Object`
- **Default**: `undefined` 

The animation options used to pan the overlay into view.

## Events

All events emit the new property value as argument.

- `update:position`
- `update:offset`
- `update:positioning`
