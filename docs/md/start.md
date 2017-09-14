<b-message type="is-warning">

::: content

## Requirements

- [Vue](https://vuejs.org/ "Vue Homepage")<!-- {target="_blank"} --> version **^2.3**.
- [OpenLayers](https://openlayers.org/ "OpenLayers Homepage")<!-- {target="_blank"} --> version **^3.14**.

:::

</b-message>

::: content

## Installation

### NPM

Install latest versions of **Vue** and **C_PKG_FULLNAME** _(recommended)_:

```bash
npm install --save vue C_PKG_NAME
```

### CDN

Include C_PKG_FULLNAME files from **unpkg.com**:  

- **JavaScript** https://unpkg.com/C_PKG_NAME<!-- {a:target="_blank"} -->
- **CSS** https://unpkg.com/C_PKG_NAME/dist/C_PKG_NAME.css<!-- {a:target="_blank"} -->

:::

<b-message type="is-info">

Do not forget to include **Vue** and **OpenLayers** JS files.    
This files aren't included into **C_PKG_FULLNAME** library. 

</b-message>

::: content

### Build from source

Clone C_PKG_FULLNAME repository from [GitHub](C_PKG_REPOSITORY) and deploy:

```bash
git clone --recursive -j8 C_PKG_REPOSITORY.git
cd C_PKG_NAME
npm install
npm run build
ls -l dist
```

## Build variants

All builds are stored at the [`dist` directory of the NPM package](https://unpkg.com/C_PKG_NAME/dist/)<!-- {a:target="_blank"} -->

| Type                          | Environments        | JS                                               | CSS                |
|-------------------------------|---------------------|--------------------------------------------------|--------------------|
| **ES modules**                | Webpack 2 / Rollup  | `C_PKG_NAME.es.js`                               | `C_PKG_NAME.css`   |
| **CommonJS all-in-one**       | Webpack 1/ NodeJS   | `C_PKG_NAME.cjs.js`                              | `C_PKG_NAME.css`   |
| **CommonJS separate modules** | Webpack 1/ NodeJS   | `modules/**/*.js`                                | `modules/**/*.css` |
| **UMD**                       | Browser / RequireJS | `C_PKG_NAME.umd.js`<br />`C_PKG_NAME.umd.min.js` | `C_PKG_NAME.css`   |

## Usage

### NPM / Webpack / Rollup

Add to your entry file C_PKG_FULLNAME initialization:

```js
import Vue from 'vue'
import C_PKG_FULLNAME from 'C_PKG_NAME'
// import C_PKG_FULLNAME styles, needs css-loader
import 'C_PKG_NAME/dist/C_PKG_NAME.css'

// register all vl-* components
Vue.use(C_PKG_FULLNAME)
// now you are ready to go further
// ...
````

### Browser / RequireJS

```html
<!-- include Vue and OpenLayers -->
<script src="https://unpkg.com/vue"></script>
<script src="https://unpkg.com/openlayers"></script>
<!-- include C_PKG_FULLNAME files -->
<link rel="stylesheet" href="https://unpkg.com/C_PKG_NAME/dist/C_PKG_NAME.css">
<script src="https://unpkg.com/C_PKG_NAME"></script>

<script>
// C_PKG_FULLNAME exports itself to the global variable: window.C_PKG_FULLNAME 
Vue.use(C_PKG_FULLNAME)
// now you are ready to go further
// ...
</script>
```

### Individual components

With **Webpack 2** / **Rollup** bundler (supports ES module system and tree-shaking) you can simply import 
directly that components:  

```js
import Vue from 'vue'
import { Map, TileLayer, OsmSource } from 'C_PKG_NAME'
import 'C_PKG_NAME/dist/C_PKG_NAME.css'

Vue.use(Map)
Vue.use(View)
Vue.use(TileLayer)
Vue.use(OsmSource)
```

For pure **NodeJS** environment or bundler that doesn't support ES modules (**Webpack 1**, **Browserify**) there is 
separate CommonJS modules in [`dist/modules` directory](https://unpkg.com/C_PKG_NAME/dist/modules/)<!-- {a:target="_blank"} -->.    
You can import them manually:

<b-tabs>
<b-tab-item label="JS">

```js
const Vue = require('Vue')
const Map = require('C_PKG_NAME/modules/map')
const TileLayer = require('C_PKG_NAME/modules/tile-layer')
const OsmSource = require('C_PKG_NAME/modules/osm-source')

Vue.use(Map)
Vue.use(TileLayer)
Vue.use(OsmSource)
````

</b-tab-item>
<b-tab-item label="HTML">

```html
<!-- include Vue and OpenLayers -->
<script src="https://unpkg.com/vue"></script>
<script src="https://unpkg.com/openlayers"></script>
<!-- include C_PKG_FULLNAME files -->
<link rel="stylesheet" href="https://unpkg.com/C_PKG_NAME/dist/modules/map/style.css">
```

</b-tab-item>
</b-tabs>

:::
