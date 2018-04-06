# vl-overlay

> HTML element attached to geographical coordinate

`vl-overlay` component creates a HTML element that would be displayed over 
the map. It has **default** scoped slot to render your custom content. You can
place it any component with slot inside the map components tree to easily bind
it to some coordinate (for example: inside `vl-feature` or `vl-view`).

## Versions

`vl-overlay` component is a part of **Overlay** module:

* **ES6**: https://unpkg.com/vuelayers/lib/_esm/overlay/
* **CommonJS**: https://unpkg.com/vuelayers/lib/overlay/

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
            <div class="overlay-content">
                Hello world!
            </div>
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