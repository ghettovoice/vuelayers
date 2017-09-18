<b-message type="is-warning">

## Requirements

- [Vue](https://vuejs.org/ "Vue Homepage")<!-- {target="_blank"} --> version **^2.3**.
- [OpenLayers](https://openlayers.org/ "OpenLayers Homepage")<!-- {target="_blank"} --> version **^3.14**.

</b-message>

## Installation

### NPM

Install latest versions of **Vue** and **C_PKG_FULLNAME** _(recommended)_:

```bash
npm install --save vue C_PKG_NAME
```

### CDN

Include C_PKG_FULLNAME files from **unpkg.com**:  

- **JavaScript** https://unpkg.com/C_PKG_NAME<!-- {a:target="_blank"} -->
- **CSS** https://unpkg.com/C_PKG_NAME/lib/style.css<!-- {a:target="_blank"} -->

<b-message type="is-info">

Do not forget to include **Vue** and **OpenLayers** JS files.    
This files aren't included into **C_PKG_FULLNAME** library. 

</b-message>

### Build from source

<b-message type="is-warning">

**NOTE**: Node **v6+** is required.

</b-message>

Clone **C_PKG_FULLNAME** repository from [GitHub](C_PKG_REPOSITORY) and deploy:

```bash
git clone --recursive -j8 C_PKG_REPOSITORY.git
cd C_PKG_NAME
npm install
# build all targets
npm run build
# or only what you need, --bundles argument accepts list of targets 
# separated by comma (es, cjs, umd, umd-min)
npm run rollup -- --bundles es,cjs
# check lib dir, there are all ready to use components
ls -l lib
```

## NPM package description

**C_PKG_FULLNAME** distributes as a set of standalone builds as well as set of separate components packages 
compiled into different module system types (**ES**, **CommonJS**, **AMD**, **IIFE**). All distributed files can be 
found at the [`lib` directory](https://unpkg.com/C_PKG_NAME/lib/)<!-- {a:target="_blank"} --> of the **NPM** package.  
Each directory includes a set of index files: `lib/**/index.js`, `lib/**/index.es.js`, `lib/**/index.umd.js` and `lib/**/index.umd.min.js`.  
All stylesheets are compiled to files: `lib/style.css` and `lib/style.min.css`.

| Module system  | Environments       | JS                                                                                              | CSS               |
|----------------|--------------------|-------------------------------------------------------------------------------------------------|-------------------|
| ES modules     | Webpack 2, Rollup  | `lib/index.es.js`, `lib/**/index.es.js`                                                         | `lib/style.css`   |
| CommonJS       | Webpack 1, NodeJS  | `lib/index.js`, `lib/**/index.js`                                                               | `lib/style.css`   |
| UMD            | Browser, RequireJS | `lib/index.umd.js`, `lib/index.umd.min.js`,<br>`lib/**/index.umd.js`, `lib/**/index.umd.min.js` | `lib/style.css`   |

## Usage

### NPM / Webpack / Rollup

Add to **app entry** file **C_PKG_FULLNAME** initialization:

```js
// main.js
import Vue from 'vue'
import C_PKG_FULLNAME from 'C_PKG_NAME'
// import C_PKG_FULLNAME styles, needs css-loader
import 'C_PKG_NAME/lib/style.css'

// register all vl-* components
Vue.use(C_PKG_FULLNAME)
// now you are ready to go further
// ...
````

### Browser

```html
<!-- include Vue and OpenLayers -->
<script src="https://unpkg.com/vue"></script>
<script src="https://unpkg.com/openlayers"></script>
<!-- include standalone C_PKG_FULLNAME files -->
<link rel="stylesheet" href="https://unpkg.com/C_PKG_NAME/lib/style.css">
<script src="https://unpkg.com/C_PKG_NAME"></script>

<script>
// C_PKG_FULLNAME exports itself to the global variable: window.C_PKG_FULLNAME 
Vue.use(C_PKG_FULLNAME)
// now you are ready to go further
// ...
</script>
```

### Individual components

With **Webpack 2** / **Rollup** bundler (supports **ES module system** and **tree-shaking**) you can simply import 
directly that components:  

```js
import Vue from 'vue'
import { Map, TileLayer, OsmSource } from 'C_PKG_NAME'
// import C_PKG_FULLNAME styles, needs css-loader
import 'C_PKG_NAME/lib/style.css'

Vue.use(Map)
Vue.use(TileLayer)
Vue.use(OsmSource)
```

For pure **NodeJS** environment or bundlers that doesn't support **ES modules** (like **Webpack 1**, **Browserify**) 
you can import them manually:

```js
const Vue = require('Vue')
const Map = require('C_PKG_NAME/lib/map')
const TileLayer = require('C_PKG_NAME/lib/tile-layer')
const OsmSource = require('C_PKG_NAME/lib/osm-source')
// import C_PKG_FULLNAME styles, needs css-loader
require('C_PKG_NAME/lib/style.css')

Vue.use(Map)
Vue.use(TileLayer)
Vue.use(OsmSource)
````

With the tools like [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) or 
[babel-plugin-component](https://github.com/QingWei-Li/babel-plugin-component) you can setup **auto import** of JS files.  
Example `.babelrc` config:

```json
{
  "presets": [
    ["env", "stage-2"]
  ],
  "plugins": [
    ["component", {
      "libraryName": "C_PKG_NAME"
    }]
  ]
}
```
