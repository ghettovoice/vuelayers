# vl-layer-tile

> Renders tiled images organized in grids

`vl-layer-tile` can render images from sources that provide pre-rendered, tiled images in
grids organized by zoom levels. It should be used together with tiled source components like
[`vl-source-xyz`](/docs/component/xyz-source.md), [`vl-source-wmts`](/docs/component/wmts-source.md), [`vl-source-osm`](/docs/component/osm-source.md).

## Versions

`vl-layer-tile` component is a part of **TileLayer** module:

- **ES6**: https://unpkg.com/vuelayers/lib/tile-layer/

## Usage

Example below shows how to use `vl-layer-tile` component together with [`vl-source-wmts`](/docs/component/wmts-source.md)
and with [`vl-source-sputnik`](/docs/component/sputnik-source.md).

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
    
    <vl-layer-tile>
      <vl-source-sputnik></vl-source-sputnik>
    </vl-layer-tile>
    
    <vl-layer-tile id="wmts">
      <vl-source-wmts :attributions="attribution" :url="url" :layer-name="layerName" :matrix-set="matrixSet" :format="format" 
                      :style-name="styleName"></vl-source-wmts>
    </vl-layer-tile>
  </vl-map>
</template>

<script>
  export default {
    data () {
      return { 
        zoom: 2,
        center: [-90, 50],
        rotation: 0,
        url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/',
        layerName: '0',
        matrixSet: 'EPSG:3857',
        format: 'image/png',
        styleName: 'default',
        attribution: 'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
                                        'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</a>',
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

### z-index

- **Type**: `number`
- **Default**: `0`

The z-index for layer rendering.

### preload

- **Type**: `number`
- **Default**: `0`

Low-resolution tiles up to `preload` level will be load. 
