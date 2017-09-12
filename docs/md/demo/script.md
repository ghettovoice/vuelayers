::: content

```js
import { kebabCase, range, random } from 'lodash/fp'
import { ol as vlol } from 'C_PKG_NAME'
import pacmanFeaturesCollection from '../static/sample-data/pacman.geojson'

const methods = {
  pointOnSurface: vlol.geom.pointOnSurface,
  geometryTypeToCmpName (type) {
    return 'vl-geom-' + kebabCase(type)
  },
  pacmanStyleFunc () {
    const pacman = [
      vlol.style.style({
        strokeColor: '#de9147',
        strokeWidth: 3,
        fillColor: [222, 189, 36, 0.8],
      }),
    ]
    const path = [
      vlol.style.style({
        strokeColor: 'blue',
        strokeWidth: 1,
      }),
      vlol.style.style({
        imageRadius: 5,
        imageFillColor: 'orange',
        geom (feature) {
          // geometry is an LineString, convert it to MultiPoint to style vertex
          return vlol.geom.multiPoint(feature.getGeometry().getCoordinates())
        },
      }),
    ]
    const eye = [
      vlol.style.style({
        imageRadius: 6,
        imageFillColor: '#444444',
      }),
    ]

    return function __pacmanStyleFunc (feature) {
      switch (feature.getId()) {
        case 'pacman':
          return pacman
        case 'pacman-path':
          return path
        case 'pacman-eye':
          return eye
      }
    }
  },
  clusterStyleFunc () {
    const cache = {}

    return function __clusterStyleFunc (feature) {
      const size = feature.get('features').length
      let style = cache[size]

      if (!style) {
        style = vlol.style.style({
          imageRadius: 10,
          strokeColor: '#fff',
          fillColor: '#3399cc',
          text: size.toString(),
          textFillColor: '#fff',
        })
        cache[size] = style
      }
      return [style]
    }
  },
  selectFilter (feature) {
    return ['position-feature'].indexOf(feature.getId()) === -1
  },
  onUpdatePosition (coordinate) {
    this.deviceCoordinate = coordinate
  },
  onMapPostCompose ({ vectorContext, frameState }) {
    if (!this.$refs.marker || !this.$refs.marker.$feature) return

    const feature = this.$refs.marker.$feature
    if (!feature.getGeometry() || !feature.getStyle()) return

    const flashGeom = feature.getGeometry().clone()
    const duration = feature.get('duration')
    const elapsed = frameState.time - feature.get('start')
    const elapsedRatio = elapsed / duration
    const radius = vlol.easing.easeOut(elapsedRatio) * 35 + 5
    const opacity = vlol.easing.easeOut(1 - elapsedRatio)
    const fillOpacity = vlol.easing.easeOut(0.5 - elapsedRatio)

    vectorContext.setStyle(vlol.style.style({
      imageRadius: radius,
      fillColor: [119, 170, 203, fillOpacity],
      strokeColor: [119, 170, 203, opacity],
      strokeWidth: 2 + opacity,
    }))

    vectorContext.drawGeometry(flashGeom)
    vectorContext.setStyle(feature.getStyle()(feature)[0])
    vectorContext.drawGeometry(feature.getGeometry())

    if (elapsed > duration) {
      feature.set('start', Date.now())
    }

    this.$refs.map.render()
  },
  // map panel
  mapPanelTabClasses (tab) {
    return {
      'is-active': this.mapPanel.tab === tab,
    }
  },
  onMapPanelLayerClick (layer) {
    layer.visible = !layer.visible
  },
  onMapPanelTabClick (tab) {
    this.mapPanel.tab = tab
  },
}

export default {
  name: 'vld-demo-app',
  methods,
  data () {
    return {
      center: [0, 0],
      zoom: 2,
      rotation: 0,
      clickCoordinate: undefined,
      selectedFeatures: [],
      deviceCoordinate: undefined,
      mapPanel: {
        tab: 'state',
      },
      layers: [
        {
          id: 'pacman',
          title: 'Pacman',
          cmp: 'vl-layer-vector',
          visible: false,
          source: {
            cmp: 'vl-source-vector',
            staticFeatures: pacmanFeaturesCollection.features,
          },
          style: [
            {
              cmp: 'vl-style-func',
              factory: this.pacmanStyleFunc,
            },
          ],
        },
        {
          id: 'countries',
          title: 'Countries',
          cmp: 'vl-layer-vector',
          visible: false,
          source: {
            cmp: 'vl-source-vector',
            url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
          },
          style: [
            {
              cmp: 'vl-style-box',
              styles: {
                'vl-style-fill': {
                  color: [255, 255, 255, 0.5],
                },
                'vl-style-stroke': {
                  color: '#219e46',
                  width: 2,
                },
              },
            },
          ],
        },
        {
          id: 'wms',
          title: 'WMS',
          cmp: 'vl-layer-tile',
          visible: false,
          source: {
            cmp: 'vl-source-wms',
            url: 'https://ahocevar.com/geoserver/wms',
            layers: 'topp:states',
            extParams: { TILED: true },
            serverType: 'geoserver',
          },
        },
        {
          id: 'wmts',
          title: 'WMTS',
          cmp: 'vl-layer-tile',
          visible: false,
          source: {
            cmp: 'vl-source-wmts',
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/',
            layerName: '0',
            matrixSet: 'EPSG:3857',
            format: 'image/png',
            styleName: 'default',
          },
        },
        {
          id: 'cluster',
          title: 'Cluster',
          cmp: 'vl-layer-vector',
          visible: false,
          source: {
            cmp: 'vl-source-cluster',
            distance: 40,
            source: {
              cmp: 'vl-source-vector',
              features: range(0, 20000).map(i => {
                let coordinate = [random(-50, 50), random(-50, 50)]

                return {
                  type: 'Feature',
                  id: 'random-' + i,
                  geometry: {
                    type: 'Point',
                    coordinates: coordinate,
                  },
                }
              }),
            },
          },
          style: [
            {
              cmp: 'vl-style-func',
              factory: this.clusterStyleFunc,
            },
          ],
        },
      ],
    }
  },
}
```

:::
