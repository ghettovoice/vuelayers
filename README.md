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

## Usage

#### Full import  

Import full library code with all components and mixins

```js
import Vue from 'vue'
import VueLayers from 'vuelayers'

Vue.use(VueLayers)
// now all components installed and ready to use
new Vue({
  el: '#app',
  render: h => h(App)
})
```

**Note**: CSS file needs to be imported separately.    
Inside your App.vue

```vue
<template>...</template>
<script>...</script>
<style>
  @import "~vuelayers/dist/style.css";
</style>
```

#### On demand  

First, install [babel-plugin-component](https://github.com/QingWei-Li/babel-plugin-component)

```bash
npm install babel-plugin-component -D
```

Then edit your `.babelrc`

```json
{
  "presets": [
    ["es2015", "latest"]
  ],
  "plugins": [["component", [
    {
      "libraryName": "vuelayers",
      "style": true,
      "libDir": "dist"
    }
  ]]]
}
```

Now you can import only what you need

```js
import Vue from 'vue'
import { Map, View, LayerTile, SourceOsm } from 'vuelayers'

Vue.use(Map)
Vue.use(View)
Vue.use(LayerTile)
Vue.use(SourceOsm)

new Vue({
  el: '#app',
  render: h => h(App)
})
```

**Note**: the above library setup automatically imports CSS files

## Documentation

TODO

## Build Setup

``` bash
git clone https://gitlab.com/ghettovoice/vuelayers.git
cd vuelayers

# install Vue and VueLayers dependencies
npm install vue && npm install

# serve with hot reload at localhost:8080
npm run dev
npm start

# demo 
npm run demo

# build
npm run build

# build and view the bundle analyzer report
npm run build --report

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
