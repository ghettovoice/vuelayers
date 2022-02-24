# ol-ext

> Mini library with OpenLayers related helpers

`ol-ext` module provides a set of small helpers to work with native OpenLayers API in the functional style. You can
use it for example for style building in style functions, coordinates projection transforming and more. 

It is published as separate sub-package in **ES6** version and should be imported explicitly:

```js
import { createStyle } from 'vuelayers/dist/ol-ext'

const style = createStyle({
  imageRadius: 10,
  imageStrokeColor: '#fff',
  imageFillColor: '#3399cc',
  text: 'qwerty',
  textFillColor: '#fff',
})
// with OpenLayers native API
// import { Style, Circle, Fill, Stroke, Text } from 'ol/style'
// style = new Style({
//   image: new Circle({
//     radius: 10,
//     fill: new Fill({ color: '#3399cc' }),
//     stroke: new Stroke({ color: '#fff' }),
//   }),
//   text: new Text({
//     text: size.toString(),
//     fill: new Fill({ color: '#fff' }),
//   }),
// })
```

In **UMD** version it is exported to `VueLayers.olExt` path.

```html
<script src="https://unpkg.com/vuelayers@latest/dist/vuelayers.umd.js"></script>
<script>
  const style = VueLayers.olExt.createStyle({
    imageRadius: 10,
    imageStrokeColor: '#fff',
    imageFillColor: '#3399cc',
    text: 'qwerty',
    textFillColor: '#fff',
  })
</script>
```
