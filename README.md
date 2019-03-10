<p align="center">
  <a href="https://vuelayers.github.io/" target="_blank" title="VueLayers Homepage">
    <img width="100" src="https://vuelayers.github.io/_media/logo.svg"><br />
  </a>
</p>

# [VueLayers](https://vuelayers.github.io/)
> Web map [Vue](https://vuejs.org/ "Vue Homepage") components with the power of [OpenLayers](https://openlayers.org/ "OpenLayers Homepage")

[![Build Status](https://travis-ci.org/ghettovoice/vuelayers.svg?branch=master)](https://travis-ci.org/ghettovoice/vuelayers)
[![Coverage Status](https://coveralls.io/repos/github/ghettovoice/vuelayers/badge.svg?branch=master)](https://coveralls.io/github/ghettovoice/vuelayers?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![GitHub tag](https://img.shields.io/github/tag/ghettovoice/vuelayers.svg)](https://github.com/ghettovoice/vuelayers/releases)
[![NPM version](https://img.shields.io/npm/v/vuelayers.svg)](https://www.npmjs.com/package/vuelayers)
[![License](https://img.shields.io/github/license/ghettovoice/vuelayers.svg)](https://github.com/ghettovoice/vuelayers/blob/master/LICENSE)
[![Dependencies](https://img.shields.io/david/ghettovoice/vuelayers.svg)](https://david-dm.org/ghettovoice/vuelayers)
[![Dev dependencies](https://img.shields.io/david/dev/ghettovoice/vuelayers.svg)](https://david-dm.org/ghettovoice/vuelayers?type=dev)

## Overview

**VueLayers** is components library that brings the powerful **OpenLayers API** to the **Vue.js** reactive world. 
It can display maps with tiled, raster or vector layers loaded from different sources.

## Versions

**NOTE**: you are reading README for the next version **v0.12.x**.  

| Vuelayers           | Branch                                                           | Vue     | OpenLayers |
| :------------------ | :--------------------------------------------------------------- | :------ | :--------- |
| Current **0.11.x**  | [v0.11.x](https://github.com/ghettovoice/vuelayers/tree/v0.11.x) | **2.3** | **5.x**    |
| Next **0.12.x**     | [master](https://github.com/ghettovoice/vuelayers/tree/master)   | **2.3** | **5.x**    |
| Previous **0.10.x** | [v0.10.x](https://github.com/ghettovoice/vuelayers/tree/v0.10.x) | **2.3** | **4.x**    |

## Links

- [Documentation](https://vuelayers.github.io/)
- [Install & Quick start guide](https://vuelayers.github.io/#/quickstart)
- [Official Demo app](https://vuelayers.github.io/#/demo)

## Requirements

- [Vue](https://vuejs.org/) version **^2.3**
- [OpenLayers](https://openlayers.org/) version **^5.0**

## Install

```bash
# install Vue
npm install vue

# install current VueLayers version 
npm install vuelayers

# install next VueLayers version
npm install vuelayers@next
```

## Build Setup

**NOTE**: Node **v8+** is required.

``` bash
git clone --recursive -j8 https://github.com/ghettovoice/vuelayers.git
cd vuelayers

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm start

# build for production
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## License

**MIT** (c) 2017-2018, Vladimir Vershinin  
Based on [Vue](https://vuejs.org/) and [OpenLayers](https://openlayers.org/)
