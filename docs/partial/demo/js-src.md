```js
import { kebabCase } from 'lodash/fp'
import { ol as vlol } from 'vuelayers'

const methods = {
  geometryTypeToCmpName (type) {
    return 'vl-geom-' + kebabCase(type)
  },
  pacmanStyleFunc () {
    // first argument is an style helper. See https://github.com/ghettovoice/vuelayers/blob/master/src/ol-ext/style.js
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
  onUpdatePosition (coordinate) {
    console.log('current position', coordinate)
  },
}

export default {
  name: 'vld-demo-app',
  methods,
  data () {
    return {
      center: [0, 0],
      zoom: 1,
      rotation: 0,
      layers: [
        {
          id: 'pacman',
          cmp: 'vl-layer-vector',
          visible: true,
          source: {
            cmp: 'vl-source-vector',
            url: '../static/pacman.geojson',
          },
          style: [
            {
              cmp: 'vl-style-func',
              factory: this.pacmanStyleFunc,
            },
          ],
        },
      ],
    }
  },
}
```
