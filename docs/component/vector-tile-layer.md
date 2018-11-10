# vl-layer-vector-tile

> Renders tiled images organized in grids

`vl-layer-vector-tile` can render tiled vector data in grids organized by zoom levels. It should be used together with 
[`vl-source-vector-tile`](/docs/component/vector-tile-source.md) component.

## Versions

`vl-layer-vector-tile` component is a part of **VectorTileLayer** module:

- **ES6**: https://unpkg.com/vuelayers/lib/vector-tile-layer/

## Usage

Below is example taken from [OpenLayers Examples page](http://openlayers.org/en/latest/examples/vector-tile-info.html?q=vectortile)
and implemented in Vue.

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
    
    <vl-layer-vector-tile>
      <vl-source-vector-tile :url="url"></vl-source-vector-tile>
      <vl-style-box>
        <vl-style-stroke :width="2" color="#2979ff"></vl-style-stroke>
        <vl-style-circle :radius="5">
          <vl-style-stroke :width="1.5" color="#2979ff"></vl-style-stroke>
        </vl-style-circle>
      </vl-style-box>
    </vl-layer-vector-tile>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return { 
        zoom: 5,
        center: [0, 0],
        rotation: 0,
        url: 'https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer/tile/{z}/{y}/{x}.pbf',
      }
    },
  }
</script>
</script> 

## Properties

### id

- **Type**: `string | number`
- **Default**: `uuid.v4()`

Some unique layer identifier,

### extent

- **Type**: `number[]`
- **Default**: `undefined`

The bounding extent for layer rendering. The layer will not be rendered outside of this extent.

### visible

- **Type**: `boolean`
- **Default**: `true`

Whether the layer will be visible on the map.

### opacity

- **Type**: `number`
- **Default**: `1`

Layer opacity value between `[0, 1]`.

### overlay

- **Type**: `boolean`
- **Default**: `false`

When set to `true` the layer will be rendered as overlay. The map will not manage this layer in its layers collection, 
and the layer will be rendered on top.

### min-resolution

- **Type**: `number`
- **Default**: `undefined`

The minimum resolution (inclusive) at which this layer will be visible.

### max-resolution

- **Type**: `number`
- **Default**: `undefined`

The maximum resolution (exclusive) below which this layer will be visible.

### preload

- **Type**: `number`
- **Default**: `0`

Low-resolution tiles up to `preload` level will be load.

### render-mode

- **Type**: `string`
- **Default**: `hybrid`

Available render modes:

- `image` - vector tiles are rendered as images. Great performance, but point symbols and texts are always rotated with 
  the view and pixels are scaled during zoom animations.
- `hybrid` - polygon and line elements are rendered as images, so pixels are scaled during zoom animations. Point symbols 
  and texts are accurately rendered as vectors and can stay upright on rotated views.
- `vector` - vector tiles are rendered as vectors. Most accurate rendering even during animations, but slower performance 
  than the other options.
  
### render-buffer

- **Type**: `number`
- **Default**: `100`

The buffer around the tile extent used by the renderer when getting features from the vector tile for the rendering or hit-detection. 
**Recommended value**: Vector tiles are usually generated with a buffer, so this value should match the largest possible 
buffer of the used tiles. It should be at least the size of the largest point symbol or line width.

### render-order

- **Type**: `function(feature1 ol.Feature, feature2 ol.Feature)`
- **Default**: `undefined`

A function to be used when sorting features before rendering.

### declutter

- **Type**: `boolean`
- **Default**: `false`

Declutter images and text. Decluttering is applied to all image and text styles, and the priority is defined by 
the `z-index` of the style. Lower `z-index` means higher priority.

### update-while-animating

- **Type**: `boolean`
- **Default**: `false`

When set to `true`, feature batches will be recreated during animations. This means that no vectors will be shown clipped, 
but the setting will have a performance impact for large amounts of vector data.

### update-while-interacting

- **Type**: `boolean`
- **Default**: `false`

When set to `true`, feature batches will be recreated during interactions.

### z-index

- **Type**: `number`
- **Default**: `0`

The z-index for layer rendering.
