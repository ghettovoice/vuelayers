# ol-ext

> Mini library with OpenLayers related helpers

`ol-ext` module provides a set of small helpers to work with native OpenLayers API in the functional style. You can
use it for example for style building in style functions, or creating and registering custom projections,
coordinates projection transforming and more. 

It is published as separate sub-package in **ES6** version and should be imported explicitly:

```js
import * as olExt from 'vuelayers/lib/ol-ext'

let myProj = olExt.createProj({
  code: 'xkcd-image',
  units: 'pixels',
  extent,
})
olExt.addProj(myProj)
```

or you can use only part of helpers

```js
import { createProj, addProj } from 'vuelayers/lib/ol-ext'

let myProj = createProj({
  code: 'xkcd-image',
  units: 'pixels',
  extent,
})
addProj(myProj)
```

In **UMD** version it is exported to `VueLayers.olExt` path.

```html
<script src="https://unpkg.com/vuelayers@latest/lib/index.umd.js"></script>
<script>
  let customProj = VueLayers.olExt.createProj({
    code: 'xkcd-image',
    units: 'pixels',
    extent,
  })
  VueLayers.olExt.addProj(customProj)
</script>
```
