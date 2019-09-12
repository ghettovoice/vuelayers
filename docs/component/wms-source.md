# vl-source-wms

## ES6 Module

```javascript
import { WmsSource } from 'vuelayers'

Vue.use(WmsSource)
```

## Properties

### extParams

- **Type**: `object`
- **Example**: `{tiled: true, tilesOrigin: [0, 0]}`

Extra parameters to be passed to the `TileWMS` constructor. Corresponds to [`params`](https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS.html) except that other properties like `layers` are specified separately.
