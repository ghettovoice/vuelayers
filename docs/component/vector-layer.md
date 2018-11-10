# vl-layer-vector

> Renders vector data

`vl-layer-vector` can render vector from verious backend services. It should be
used with together with [`vl-source-vector`](/docs/component/vector-source.md) component.

## Versions

`vl-layer-vector` is a part of **VectorLayer** module:

- **ES6**: https://unpkg.com/vuelayers/lib/vector-layer/

## Usage

Example below shows how you can use `vl-layer-vector` and [`vl-source-vector`](/docs/component/vector-source.md) to render some 
vector vector features from remote backend.

<vuep template="#usage-example"></vuep>

<script v-pre type="text/x-template" id="usage-example">
<template>
  <div>
    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
      
      <vl-layer-tile>
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>
      
      <vl-layer-vector>
        <vl-source-vector :features.sync="features"></vl-source-vector>
        
        <vl-style-box>
          <vl-style-stroke color="green" :width="3"></vl-style-stroke>
          <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
        </vl-style-box>
      </vl-layer-vector>
    </vl-map>
    <p v-if="loading">
      Loading features, please wait...
    </p>
    <p v-if="features.length > 0">
      Loaded features: {{ features.map(feature => feature.id) }}
    </p>
  </div>
</template>

<script>
  export default {
    data () {
      return { 
        zoom: 2,
        center: [0, 0],
        rotation: 0,
        features: [],
        loading: false,
      }
    },
    mounted () {
      this.loading = true
      this.loadFeatures().then(features => {
        this.features = features.map(Object.freeze)
        this.loading = false
      })
    },
    methods: {
      // emulates external source
      loadFeatures () {
        return new Promise(resolve => {
          setTimeout(() => {
            // generate GeoJSON random features
            resolve([
              {
                type: "Feature",
                id: fakerator.misc.uuid(),
                geometry: {
                  type: 'Point',
                  coordinates: [5.44921875, 26.745610382199022],
                },
                properties: {
                  name: fakerator.names.name(),
                  country:  fakerator.address.country(),
                  city: fakerator.address.city(),
                  street: fakerator.address.street(),
                },
              },
              {
                type: "Feature",
                id: fakerator.misc.uuid(),
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [
                        -23.37890625,
                        45.336701909968134,
                      ],
                      [
                        -49.39453125,
                        33.137551192346145,
                      ],
                      [
                        -47.4609375,
                        3.6888551431470478,
                      ],
                      [
                        -20.390625,
                        -8.059229627200192,
                      ],
                      [
                        -13.0078125,
                        20.138470312451155,
                      ],
                      [
                        -23.37890625,
                        45.336701909968134,
                      ],
                    ],
                  ],
                },
                properties: {
                  name: fakerator.names.name(),
                  country:  fakerator.address.country(),
                  city: fakerator.address.city(),
                  street: fakerator.address.street(),
                },
              },
              {
                type: "Feature",
                id: fakerator.misc.uuid(),
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [
                      44.47265625,
                      -1.7575368113083125,
                    ],
                    [
                      23.5546875,
                      9.795677582829743,
                    ],
                    [
                      47.109375,
                      23.241346102386135,
                    ],
                    [
                      22.8515625,
                      33.137551192346145,
                    ],
                    [
                      48.33984375,
                      42.032974332441405,
                    ],
                    [
                      19.86328125,
                      48.574789910928864,
                    ],
                    [
                      47.8125,
                      56.65622649350222,
                    ],
                  ],
                },
                properties: {
                  name: fakerator.names.name(),
                  country:  fakerator.address.country(),
                  city: fakerator.address.city(),
                  street: fakerator.address.street(),
                },
              },
            ])
          }, 5000)
        })
      },
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

### render-mode

- **Type**: `string`
- **Default**: `vector`

Render mode for vector layers:

- `vector` - renders layer as vector: most accurate rendering during animation, but slower performance.
- `image` - renders layer as image: great performance, but point symbols and texts are always rotated 
  with view, and pixels are scaled during zoom animation.

Comparison of two render modes, try to zoom in/out to see differences

<vuep template="#image-mode-example"></vuep>

<script v-pre type="text/x-template" id="image-mode-example">
<template>
  <div style="height: 400px; display: flex">
    <div style="width: 50%">
      <h5>Render mode: <code>vector</code></h5>
      <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326">
        <vl-view ident="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"></vl-view>

        <vl-layer-tile>
          <vl-source-osm></vl-source-osm>
        </vl-layer-tile>

        <vl-layer-vector>
          <vl-source-vector :features.sync="features"></vl-source-vector>
        </vl-layer-vector>
      </vl-map>
    </div>
    <div style="width: 50%">
      <h5>Render mode: <code>image</code></h5>
      <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326">
        <vl-view ident="view" :center.sync="center"></vl-view>

        <vl-layer-tile>
          <vl-source-osm></vl-source-osm>
        </vl-layer-tile>

        <vl-layer-vector render-mode="image">
          <vl-source-vector :features.sync="features"></vl-source-vector>
        </vl-layer-vector>
      </vl-map>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return { 
        zoom: 2,
        center: [-40, 0],
        rotation: 0,
        features: [
          {
            type: "Feature",
            id: fakerator.misc.uuid(),
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [
                    -23.37890625,
                    45.336701909968134,
                  ],
                  [
                    -49.39453125,
                    33.137551192346145,
                  ],
                  [
                    -47.4609375,
                    3.6888551431470478,
                  ],
                  [
                    -20.390625,
                    -8.059229627200192,
                  ],
                  [
                    -13.0078125,
                    20.138470312451155,
                  ],
                  [
                    -23.37890625,
                    45.336701909968134,
                  ],
                ],
              ],
            },
            properties: {
              name: fakerator.names.name(),
              country:  fakerator.address.country(),
              city: fakerator.address.city(),
              street: fakerator.address.street(),
            },
          },
        ],
      }
    },
  }
</script>
</script>

### render-buffer

- **Type**: `number`
- **Default**: `100`

The buffer around the viewport extent used by the renderer when getting features from the vector source for the 
rendering or hit-detection. **Recommended value**: the size of the largest symbol, line width or label.

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
