# vl-source-xyz

`vl-source-xyz` allows you to display tiles in the XYZ format.

## ES6 Module

```javascript
import { XyzSource } from 'vuelayers'

Vue.use(XyzSource)
```

## Usage

Example of `vl-source-xyz` loading OpenStreetMap tiles. Of course for this it
would be better to use the `vl-source-osm` source.

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

    <vl-layer-tile>
      <vl-source-xyz :attributions="attributions" :url="url" :maxZoom="maxZoom" ></vl-source-bingmaps>
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

        attributions: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.',
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 19,
      }
    },
  }
</script>
</script>

## Properties

Read more at the
[openlayers](https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html)
documentation.

### attributions

- **Type**: `[String, Array, Function]`

Attributions.

### attributionsCollapsible

- **Type**: `Boolean`
- **Default**: `true`

Attributions are collapsible.

### cacheSize

- **Type**: `Number`

Initial tile cache size. Will auto-grow to hold at least the number of tiles in the viewport.

### crossOrigin

- **Type**: `String`

The `crossOrigin` attribute for loaded images. Note that you must provide a
crossOrigin value if you want to access pixel data with the Canvas renderer. See
https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more
detail.

### opaque

- **Type**: `Boolean`

Whether the layer is opaque.

### projection

- **Type**: `String`
- **Default**: `'EPSG:3857'`

Projection.

### reprojectionErrorThreshold

- **Type**: `Number`

Maximum allowed reprojection error (in pixels). Higher values can increase
reprojection performance, but decrease precision.

### maxZoom

- **Type**: `Number`
- **Default**: `42`

Optional max zoom level.

### minZoom

- **Type**: `Number`
- **Default**: `0`

Optional min zoom level.

### maxResolution:

- **Type**: `Number`

Optional tile grid resolution at level zero.

### tileClass

- **Type**: `String`

### tileGridFactory

- **Type**: `Function`

### tileLoadFunction

- **Type**: `Function`

Optional function to load a tile given a URL. The default is

```javascript
function(imageTile, src) {
  imageTile.getImage().src = src;
};
```

### tilePixelRatio

- **Type**: `Number`
- **Default**: `1`

The pixel ratio used by the tile service. For example, if the tile service
advertizes 256px by 256px tiles but actually sends 512px by 512px images (for
retina/hidpi devices) then tilePixelRatio should be set to 2.

### tileSize

- **Type**: `[Number, Array]`
- **Default**: `[256, 256]`

The tile size used by the tile service. Not used if `tileGrid` is provided.

### tileUrlFunction

- **Type**: `Function`

Optional function to get tile URL given a tile coordinate and the projection.
Required if url or urls are not provided.

### transition

- **Type**: `Number`

Duration of the opacity transition for rendering. To disable the opacity
transition, pass transition: 0.

### url

- **Type**: `String`
- **Validator**: `isNotEmptyString`

URL template. Must include `{x}`, `{y}` or `{-y}`, and `{z}` placeholders. A
`{?-?}` template pattern, for example `subdomain{a-f}.domain.com`, may be used
instead of defining each one separately in the `urls` option.

### urls

- **Type**: `Array`
- **Validator**: `isArrayOfNotEmptyStrings`

An array of URL templates.

### wrapX

- **Type**: `Boolean`
- **Default**: `true`

Whether to wrap the world horizontally.
tileKey: String,

### zDirection

- **Type**: `Number`
- **Default**: `0`

Choose whether to use tiles with a higher or lower zoom level when between
integer zoom levels.
