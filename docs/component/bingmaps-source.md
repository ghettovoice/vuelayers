# vl-source-bingmaps

> Layer source for [Bing Maps API](https://www.bing.com/maps)

`vl-source-bingmaps` adds ability to display tile data from Bing Maps. To use
this source you should get **API key** at https://www.bingmapsportal.com.

## Versions

`vl-source-bingmaps` is a part of **BingmapsSource** module:

- **ES6**: https://unpkg.com/vuelayers/lib/bingmaps-source/

## Usage

Example of `vl-source-bingmaps` usage

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

      <vl-layer-tile id="bingmaps">
          <vl-source-bingmaps :api-key="apiKey" :imagery-set="imagerySet"></vl-source-bingmaps>
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
        apiKey: 'ArbsA9NX-AZmebC6VyXAnDqjXk6mo2wGCmeYM8EwyDaxKfQhUYyk0jtx6hX5fpMn',
        imagerySet: 'AerialWithLabels',
      }
    },
  }
</script>
</script>

## Properties

### cache-size

- **Type**: `number`
- **Default**: `2048`

Cache size.

### hidpi

- **Type**: `boolean`
- **Default**: `false`

Enables hidpi tiles loading.

### culture

- **Type**: `string`
- **Default**: `en-us`

Culture code.

### api-key

- **Type**: `string`
- **Required**

Bing Maps API key. Uoy can get it here https://www.bingmapsportal.com.

### imagery-set

- **Type**: `string`
- **Required**

The type of imagery for which you are requesting metadata. See https://msdn.microsoft.com/en-us/library/ff701716.aspx.

### max-zoom

- **Type**: `number`
- **Default**: `21`

Max zoom. Default is what's advertized by the BingMaps service.

### reprojection-error-threshold

- **Type**: `number`
- **Default**: `0.5`

Maximum allowed reprojection error (in pixels).

### wrap-x

- **Type**: `boolean`
- **Default**: `true`

Whether to wrap the world horizontally.

### transition

- **Type**: `number`
- **Default**: `undefined`

Duration of the opacity transition for rendering. To disable the opacity transition, pass `0`.
