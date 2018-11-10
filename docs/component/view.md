# vl-view

> 2D representation of the map

`vl-view` is the component to act upon to change the **center**, **resolution** 
and **rotation** of the map.

## Versions

`vl-view` component is a part of **Map** module:

- **ES6**: https://unpkg.com/vuelayers/lib/map/

## Usage

Example of simple map with view in **EPSG:4326** projection.   
See also documentation of [`vl-map`](/docs/component/map.md) component.

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation" projection="EPSG:4326"></vl-view>

      <vl-layer-tile>
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

### center

- **Type**: `number[]`
- **Default**: `[0, 0]`

The center coordinate of the map view in the provided [`projection`](#projection).

### zoom

- **Type**: `number`
- **Default**: `0`

Zoom level used to calculate the resolution for the view as `int` value. 
Only used if [`resolution`](#resolution) is not defined.

### rotation

- **Type**: `number`
- **Default**: `0`

The initial rotation for the view in **radians** (positive rotation clockwise).

### resolution

- **Type**: `number`
- **Default**: `undefined`

The initial resolution for the view.  The units are projection units per pixel 
(e.g. meters per pixel). An alternative to setting this is to set [`zoom`](#zoom). 

### resolutions

- **Type**: `number[]`
- **Default**: `undefined`

Resolutions to determine the resolution constraint. If set the `max-resolution`, 
`min-resolution`, `min-zoom`, `max-zoom`, and `zoom-factor` options are ignored.

### projection

- **Type**: `string`
- **Default**: `EPSG:3857`

The view internal projection. This is the projection with which OpenLayers component
will work (`ol.View`, `ol.Feature` and other that works with geographic data). 
By all VueLayers components accepts coordinates in the view projection.  
See also how to setup [Global data projection](/docs/quickstart.md#global-data-projection).

### max-zoom

- **Type**: `number`
- **Default**: `28`

The maximum zoom level used to determine the resolution constraint.

### min-zoom

- **Type**: `number`
- **Default**: `0`

The minimum zoom level used to determine the resolution constraint.

### max-resolution

- **Type**: `number`
- **Default**: `undefined`

The maximum resolution used to determine the resolution constraint. 

### min-resolution

- **Type**: `number`
- **Default**: `undefined`

The minimum resolution used to determine the resolution constraint.

### constrain-rotation

- **Type**: `boolean | number`
- **Default**: `true`

Rotation constraint. `false` means no constraint. `true` means no constraint, but 
snap to zero near zero. A number constrains the rotation to that number of values. 
For example, `4` will constrain the rotation to `0`, `90`, `180`, and `270` degrees.

### enable-rotation

- **Type**: `boolean`
- **Default**: `true`

Enable rotation. Default is `true`. If `false` a rotation constraint that 
always sets the rotation to zero is used.

### extent

- **Type**: `number[leftBottomX, leftBottomY, rightTopX, rightTopY]`
- **Default**: `undefined`

The extent that constrains the `center` defined in the view projection, in other words, 
center cannot be set outside this extent.

### ident

- **Type**: `string`
- **Default**: `undefined`

Unique key in **identity map** for underlying `ol.View` instance to share it between 
multiple `vl-view` components in multiple `vl-map` components.

**Example**

<vuep template="#ident-example"></vuep>

<script v-pre type="text/x-template" id="ident-example">
<template>
  <div style="height: 400px; display: flex">
    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
      <vl-view ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"></vl-view>

      <vl-layer-tile>
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>
    </vl-map>

    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
      <vl-view ident="view"></vl-view>

      <vl-layer-tile>
        <vl-source-sputnik></vl-source-sputnik>
      </vl-layer-tile>
    </vl-map>
  </div>
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

### zoom-factor

- **Type**: `number`
- **Default**: `2`

The zoom factor used to determine the resolution constraint.

## Events

- `update:center` Fires when view center changed.
  Emits the new center coordinate in projection on the view (see [`projection`](#projection) and [`data-projection`](#data-projection))
- `update:zoom` Fires when view zoom changed.
  Emits the new zoom level value.
- `update:resolution` Fires when view resolution changed.
  Emits the new view resolution value.
- `update:rotation` Fires when view rotation changed.
  Emits the new rotation value.

## Methods

### animate(...args)

- **Arguments**:
  - `...args {Object | function(complete: boolean)}` Animation options or an optional callback 
    can be provided as a final argument.
    Animation options:
    - `center {number[] | undefined}` The center of the view at the end of the animation.
    - `zoom {number | undefined}` The zoom level of the view at the end of the animation. 
      This takes precedence over `resolution`.
    - `resolution {number | undefined}` The resolution of the view at the end of the animation.
    - `rotation {number | undefined}` The rotation of the view at the end of the animation.
    - `anchor {number[] | undefined}` Optional anchor to remained fixed during a rotation or resolution animation.
    - `duration {number | undefined}` The duration of the animation in milliseconds (defaults to `1000`).
    - `easing {function(t: number): number | undefined}` The easing function used during the animation.
      Default is `easeInOut`.
- **Returns**: `Promise<void>` Returns promise that will be resolved with `boolean` value
  indicating whether animation was completed or canceled.

Animates the view. To chain together multiple animations, call the method with 
multiple animation objects.  
For more info see [OpenLayers documentation](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#animate).

### fit(geometryOrExtent, options = {})

- **Arguments**: 
  - `geometryOrExtent {GeoJSONFeature|ol.Extent|ol.geom.Geometry}` The geometry or extent to fit the view to.
  - `[options] {Object}` Fit options.
    - `size {number[] | undefined}` The size in pixels of the box to fit the extent into.
      Default is the current size of the first map in the DOM that uses this view, or `[100, 100]` if no such map is found.
    - `padding {number[] | undefined}` Padding (in pixels) to be cleared inside the view. 
      Values in the array are top, right, bottom and left padding. Default is `[0, 0, 0, 0]`.
    - `constrainResolution {boolean | undefined}` Constrain the resolution. Default is `true`.
    - `nearest {boolean | undefined}` Get the nearest extent. Default is `false`.
    - `minResolution {number | undefined}` Minimum resolution that we zoom to. Default is `0`.
    - `maxZoom {number | undefined}` Maximum zoom level that we zoom to. If `minResolution` is given, this property is ignored.
    - `duration {number | undefined}` The duration of the animation in milliseconds. By default, there is no animations.
    - `easing {function(t: number): number}` The easing function used during the animation. Default is `easeInOut`.
    - `callback {function(complete: boolean) | undefined}` Optional function called when the view is in it's final position. 
- **Returns**: `Promise<void>` Returns promise that will be resolved with `boolean` value
  indicating whether animation was completed or canceled.

Fit the given geometry or extent based on the given map size and border. 
The size is pixel dimensions of the box to fit the extent into.  
For more info see [OpenLayers documentation](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit).
