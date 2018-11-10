# vl-feature

> Geographic feature representation

`vl-feature` provides properties similar the **GeoJSON** feature.  It has one 
**default slot** and acts like geometry container for [`vl-geom-*`](/docs/component/point-geom.md) 
components, without geometry component nothing will be rendered.

`vl-feature` components can be placed inside component that are mixes in 
[`featuresContainer`](/docs/mixin/features-container.md) mixin, such as [`vl-map`](/docs/component/map.md), 
[`vl-source-vector`](/docs/component/vector-source.md) and etc.

Custom feature styles can be applied with [`vl-style-*`](/docs/component/circle-style.md) 
components placed inside default slot.

## Versions

`vl-feature` component is a part of **Feature** module:

- **ES6**: https://unpkg.com/vuelayers/lib/feature/

## Usage

Features with different geometries.  
See also documentation of [`vl-geom-point`](/docs/component/point-geom.md), [`vl-geom-line-string`](/docs/component/line-string-geom.md) 
and [`vl-geom-polygon`](/docs/component/polygon-geom.md) components.

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation" projection="EPSG:4326"></vl-view>

      <vl-layer-tile id="osm">
          <vl-source-osm></vl-source-osm>
      </vl-layer-tile>

      <vl-feature id="point" :properties="{prop: 'value', prop2: 'value'}">
          <vl-geom-point :coordinates="[0, 0]"></vl-geom-point>
      </vl-feature>

      <vl-feature id="line-string" :properties="{prop: 'value', prop2: 'value'}">
          <vl-geom-line-string :coordinates="[[10, 10], [20, 20], [30, 10], [40, 20]]"></vl-geom-line-string>
      </vl-feature>

      <vl-feature id="polygon" :properties="{prop: 'value', prop2: 'value'}">
          <vl-geom-polygon :coordinates="[[[-10, -10], [-20, -20], [-30, -10], [-20, 0], [-10, -10]]]"></vl-geom-polygon>
      </vl-feature>
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

### id

- **Type**: `string | number`
- **Default**: auto-generated **UUID**

Feature identifier.

### properties

- **Type**: `Object`
- **Default**: `{}`

Feature additional properties, like in **GeoJSON** feature.

## Events

- `update:id` Fires when feature ID was changed,
- `update:properties` Fires when feature properties was changed.
