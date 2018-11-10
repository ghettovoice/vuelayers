# vl-source-vector

> Provides collection of features for vector layers

`vl-source-vector` can be used together with [`vl-layer-vector`](/docs/component/vector-layer.md) to
draw any vector data on the map.

# Versions

- **ES6**: https://unpkg.com/vuelayers/lib/vector-source/

## Usage

Static features with the help of [`vl-feature`](/docs/component/feature.md), should be used only for tiny static layers.

<vuep template="#static-features-example"></vuep>

<script v-pre type="text/x-template" id="static-features-example">
<template>
  <vl-map style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
  
    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>
    
    <vl-layer-vector>
      <vl-source-vector>
        <vl-feature>
          <vl-geom-circle :coordinates="[0, 0]" :radius="1000000"></vl-geom-circle>
          <vl-style-box>
            <vl-style-stroke color="blue"></vl-style-stroke>
            <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
            <vl-style-text text="I'm circle"></vl-style-text>
          </vl-style-box>
        </vl-feature>
        <vl-feature>
          <vl-geom-polygon :coordinates="[[[1000000, 1000000], [1000000, 5000000], [5000000, 5000000], [5000000, 1000000], [1000000, 1000000]]]"></vl-geom-polygon>
          <vl-style-box>
            <vl-style-stroke color="blue"></vl-style-stroke>
            <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
            <vl-style-text text="I'm polygon"></vl-style-text>
          </vl-style-box>
        </vl-feature>
      </vl-source-vector>
    </vl-layer-vector>
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

Load features simply by providing [`url`](/docs/component/vector-source.md#url) value, default XHR loader will be used in this
case.

<vuep template="#default-loader-example"></vuep>

<script v-pre type="text/x-template" id="default-loader-example">
<template>
  <vl-map style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
  
    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>
    
    <vl-layer-vector>
      <vl-source-vector url="https://openlayers.org/en/latest/examples/data/geojson/countries.geojson"></vl-source-vector>
    </vl-layer-vector>
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

Next example loads features from remote WFS service by viewport BBOX. With [`format-factory`](/docs/component/vector-source.md#format-factory) and 
[`strategy-factory`](/docs/component/vector-source.md#strategy-factory) you can define custom vector source format and loading strategy.

<vuep template="#wfs-example"></vuep>

<script v-pre type="text/x-template" id="wfs-example">
<template>
  <vl-map style="height: 400px">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
  
    <vl-layer-tile>
      <vl-source-osm></vl-source-osm>
    </vl-layer-tile>
    
    <vl-layer-vector>
      <vl-source-vector :url="urlFunction" :strategy-factory="loadingStrategyFactory"></vl-source-vector>
    </vl-layer-vector>
  </vl-map>
</template>

<script>
  export default {
    methods: {
      urlFunction (extent, resolution, projection) {
        return 'https://ahocevar.com/geoserver/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=osm:water_areas&' +
          'outputFormat=application/json&srsname=' + projection + '&' +
          'bbox=' + extent.join(',') + ',' + projection
      },
      loadingStrategyFactory () {
        // VueLayers.olExt available only in UMD build
        // in ES build it should be imported explicitly from 'vuelayers/lib/ol-ext' 
        return VueLayers.olExt.loadingBBox
      },
    },
    data () {
      return { 
        zoom: 12,
        center: [-8908887.277395891, 5381918.072437216],
        rotation: 0,
      }
    },
  }
</script>
</script>

Example of loading features with custom loader function that loads features by the one request. This can be useful 
when the download comes from a non-spatial API.

<vuep template="#custom-loader-example"></vuep>

<script v-pre type="text/x-template" id="custom-loader-example">
<template>
  <div>
    <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
      <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
      
      <vl-layer-tile>
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>
      
      <vl-layer-vector>
        <vl-source-vector :features.sync="features"></vl-source-vector>
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

### attributions

- **Type**: `string | string[]`

Source attributions.

### features

- **Type**: `GeoJSONFeature[]`
- **Default**: `[]`

Array of GeoJSON features with coordinates in map view projection or 
global [`data-projection`](/docs/quickstart.md#global-data-projection).

### format-factory

- **Type**: `function(): ol.format.Feature`
- **Default**: `function(): ol.format.GeoJSON`

Source format factory that returns prepared instance of [`ol.format.Feature`](http://openlayers.org/en/latest/apidoc/module-ol_format_Feature-FeatureFormat.html).
This feature format will be used by default XHR loader when [`url`](/docs/component/vector-source.md#url) provided as string.

### loader-factory

- **Type**: `function(): ol.FeatureLoader`
- **Default**: `undefined`

Source loader factory that returns [`ol.FeatureLoader`](http://openlayers.org/en/latest/apidoc/module-ol_featureloader.html) function.

### logo

- **Type**: `string`

Source logo.

### overlaps

- **Type**: `boolean`,
- **Default**: `true`

Indicates that this source may have overlapping geometries. Setting this to `false` (e.g. for sources with polygons that 
represent administrative boundaries or TopoJSON sources) allows the renderer to optimise fill and stroke operations. 

### projection

- **Type**: `string`

Projection of the source data.

### strategy-factory

- **Type**: `function(): ol.LoadingStrategy`
- **Default**: `function(): ol.loadingstrategy.all`

Loading strategy factory that returns function of [`ol.LoadingStrategy`](http://openlayers.org/en/latest/apidoc/module-ol_loadingstrategy.html) type.

### wrap-x

- **Type**: `boolean`
- **Default**: `true`

Wraps the world horizontally.

### use-spatial-index

- **Type**: `boolean`
- **Default**: `true`

By default, an RTree is used as spatial index. When features are removed and added frequently, and the total number of 
features is low, setting this to `false` may improve performance. See [OpenLayers docs for more info](http://openlayers.org/en/latest/apidoc/module-ol_source_Vector.html).

### url

- **Type**: `string | ol.FeatureUrlFunction`
- **Default**: `undefined`

A string value for a one-off download of all features from the given URL. A function of 
[`ol.FeatureUrlFunction`](http://openlayers.org/en/latest/apidoc/module-ol_featureloader.html#~FeatureUrlFunction) type can be provided 
to generate url with other loading strategy. See [OpenLayers docs for more info](http://openlayers.org/en/latest/apidoc/module-ol_source_Vector.html).
