import 'babel-polyfill'
import Vue from 'vue'
import VueLayers from '../src'
import App from './app.vue'

Vue.use(VueLayers, {
  bindToProj: 'EPSG:4326',
})
console.dir(VueLayers)
console.dir(Vue)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})
