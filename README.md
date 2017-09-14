# VueLayers

> Vue components to work with [OpenLayers](https://openlayers.org)

[![Build Status](https://travis-ci.org/ghettovoice/vuelayers.svg?branch=master)](https://travis-ci.org/ghettovoice/vuelayers)
[![Coverage Status](https://coveralls.io/repos/github/ghettovoice/vuelayers/badge.svg?branch=master)](https://coveralls.io/github/ghettovoice/vuelayers?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![GitHub tag](https://img.shields.io/github/tag/ghettovoice/vuelayers.svg)](https://github.com/ghettovoice/vuelayers/releases)
[![NPM version](https://img.shields.io/npm/v/vuelayers.svg)](https://www.npmjs.com/package/vuelayers)
[![License](https://img.shields.io/github/license/ghettovoice/vuelayers.svg)](https://github.com/ghettovoice/vuelayers/blob/master/LICENSE)
[![Dependencies](https://img.shields.io/david/ghettovoice/vuelayers.svg)](https://david-dm.org/ghettovoice/vuelayers)
[![Dev dependencies](https://img.shields.io/david/dev/ghettovoice/vuelayers.svg)](https://david-dm.org/ghettovoice/vuelayers?type=dev)

**[Demo](https://ghettovoice.github.io/vuelayers/)**

## Install

```bash
# install Vue and VueLayers
npm install -S vue vuelayers
```

## Available builds

#### UMD

- Full debug version: `dist/vuelayers.umd.js` and `dist/vuelayers.css`
- Full production version: `dist/vuelayers.umd.min.js` and `dist/vuelayers.css`

#### CommonJS

- Full version: `dist/vuelayers.cjs.js` and `dist/vuelayers.css`

#### CommonJS separate components (for plugins like `babel-plugin-component`)

- Main: `dist/modules/index.js` and `dist/modules/style.css`
- Components: `dist/modules/%component-name%/index.js` and `dist/modules/%component-name%/style.css`

#### ES6 module

- Full version: `dist/vuelayers.es.js` and `dist/vuelayers.css`

## Usage 

### Basic example with full import 

```js
// main.js
import Vue from 'vue'
import VueLayers from 'vuelayers'

Vue.use(VueLayers)
// now all components installed and ready to use
new Vue({
  el: '#app',
  render: h => h(App)
})
````

```html
// App.vue
<template>
  <div id="map">
    <vl-map>
      <vl-view />
      
      <vl-layer-tile>
        <vl-source-osm />
      </vl-layer-tile>
    </vl-map>
  </div>
</template>
<script>
  export default {}
</script>
<style>
  /* CSS file needs to be imported separately. */
  @import "~vuelayers/dist/vuelayers.css";
</style>
```

**Note about usage of different builds**

* For browser is available pre-build UMD version by simply including `dist/vuelayers.umd.min.js` and `vuelayers.css` files 
  on the page after VueJS.  
  Or use from CDN like [unpkg.org](https://unpkg.com).
    
  * [https://unpkg.com/vuelayers@latest/dist/vuelayers.umd.min.js](https://unpkg.com/vuelayers@latest/dist/vuelayers.umd.min.js)
  * [https://unpkg.com/vuelayers@latest/dist/vuelayers.css](https://unpkg.com/vuelayers@latest/dist/vuelayers.css)
  
* For NodeJS is available CommonJS version (it is included by default) from `dist/vuelayers.cjs.js` and
  appropriate stylesheet `dist/vuelayers.css`.  
  See below for example of incremental loading of what you need with tools like `babel-plugin-component`.
  
* For bundlers like Webpack 2 and Rollup is available ES6 module version from `dist/vuelayers.es.js` and 
  appropriate stylesheet `dist/vuelayers.css`.

### Incremental import  

With Webpack 2 or Rollup may be used without additional configuration, simply import what you need.
Stylesheet should be imported manually (`dist/vuelayers.css`).

```js
import Vue from 'vue'
import { Map, TileLayer, OsmSource } from 'vuelayers'

Vue.use(Map)
Vue.use(TileLayer)
Vue.use(OsmSource)

new Vue({
  el: '#app',
  render: h => h(App)
})
```

For native CommonJS or bundlers that doesn't support ES6 module system you can use tools like `babel-plugin-component`
for incremental loading.  
First, install [babel-plugin-component](https://github.com/QingWei-Li/babel-plugin-component)

Example Babel config
 
```json
{
  "presets": [
    ["env", "stage-2"]
  ],
  "plugins": [["component", [
    {
      "libraryName": "vuelayers",
      "style": true,
      "libDir": "dist/modules"
    }
  ]]]
}
```

Now you can import only what you need, only that components will be included in final build.

## Documentation

TODO

## Build Setup

``` bash
git clone https://github.com/ghettovoice/vuelayers.git
cd vuelayers

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm start

# demo 
npm run demo

# build
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## License

**MIT** (c) 2017, Vladimir Vershinin  
Based on [Vue](https://vuejs.org/) and [OpenLayers](https://openlayers.org/)
