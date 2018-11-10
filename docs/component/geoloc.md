# vl-geoloc

> HTML5 Geolocation wrapper

`vl-geoloc` provides HTML5 Geolocation capabilities as a Vue component. 
The [Geolocation API](https://www.w3.org/TR/geolocation-API/) is used to locate 
a user's position. You can place it to the **default slot** of [`vl-map`](/docs/component/map.md) component.

## Versions

`vl-geoloc` is a part of **Geoloc** module:

- **ES6**: https://unpkg.com/vuelayers/lib/geoloc/

## Usage

Example below shows basic use case of `vl-geoloc` component and how you
can render some geolocation marker.  
See also documentation of [`vl-feature`](/docs/component/feature.md) component.

!> **NOTE** You should allow geolocation tracking in your browser

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <div>
    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" 
            data-projection="EPSG:4326" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>

      <vl-geoloc @update:position="geolocPosition = $event">
        <template slot-scope="geoloc">
          <vl-feature v-if="geoloc.position" id="position-feature">
            <vl-geom-point :coordinates="geoloc.position"></vl-geom-point>
            <vl-style-box>
              <vl-style-icon src="_media/marker.png" :scale="0.4" :anchor="[0.5, 1]"></vl-style-icon>
            </vl-style-box>
          </vl-feature>
        </template>
      </vl-geoloc>

      <vl-layer-tile id="osm">
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>
    </vl-map>
    <div style="padding: 20px">
      Zoom: {{ zoom }}<br>
      Center: {{ center }}<br>
      Rotation: {{ rotation }}<br>
      My geolocation: {{ geolocPosition }}
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return { 
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        geolocPosition: undefined,
      }
    },
  }
</script>
</script>

## Properties

### tracking

- **Type**: `boolean`
- **Default**: `true`

Enables / disables tracking.

### tracking-options

- **Type**: `Object`
- **Default**: `undefined`

Tracking options. See [PositionOptions](https://www.w3.org/TR/geolocation-API/#position_options_interface) documentation.

### projection

- **Type**: `string`
- **Default**: `EPSG:3857`

Projection of the current position.

## Events

All events emit the new property value as argument.

- `update:position`
- `update:accuracy`
- `update:altitude`
- `update:altitudeaccuracy`
- `update:heading`
- `update:speed`
