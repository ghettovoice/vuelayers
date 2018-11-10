# vl-layer-image

> Renders any image from raster source

`vl-layer-image` components can render any server-rendered image, it is a container for
raster source, like [`vl-source-image-static`](/docs/component/image-static-source.md).

## Versions

`vl-layer-image` component is a part of **ImageLayer** module:

- **ES6**: https://unpkg.com/vuelayers/lib/image-layer/

## Usage

Example below shows how to use `vl-layer-image` component together with [`vl-source-image-static`](/docs/component/image-static-source.md)
to render custom image on the map. The map view is configured with a custom projection that translates image coordinates 
directly into map coordinates. Information about `olExt` usage mini library you can find [here](/docs/misc/ol-ext.md).   
Taken from OpenLayers [Static Image Example](http://openlayers.org/en/latest/examples/static-image.html) 

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
    <vl-view :projection="projection" :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-image id="xkcd">
      <vl-source-image-static :url="imgUrl" :size="imgSize" :extent="imgExtent" :projection="projection"
                              :attributions="imgCopyright"></vl-source-image-static>
    </vl-layer-tile>
  </vl-map>
</template>

<script>
  // Map views always need a projection.  Here we just want to map image
  // coordinates directly to map coordinates, so we create a projection that uses
  // the image extent in pixels.
  let size = [1024, 968]
  let extent = [0, 0, ...size]
  // create custom projection for image 
  // NOTE: VueLayers.olExt available only in UMD build
  // in ES build it should be imported explicitly from 'vuelayers/lib/ol-ext'
  let customProj = VueLayers.olExt.createProj({
    code: 'xkcd-image',
    units: 'pixels',
    extent,
  })
  // add it to the list of known projections
  VueLayers.olExt.addProj(customProj)

  export default {
    data () {
      return { 
        zoom: 2,
        maxZoom: 8,
        center: [size[0] / 2, size[1] / 2],
        rotation: 0,
        projection: customProj.getCode(),
        imgUrl: 'https://imgs.xkcd.com/comics/online_communities.png',
        imgCopyright: '© <a href="http://xkcd.com/license.html">xkcd</a>',
        imgSize: size,
        imgExtent: extent,
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
