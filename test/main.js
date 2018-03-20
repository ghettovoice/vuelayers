import Vue from 'vue'
import VueLayers from '@'
import App from './app.vue'

Vue.use(VueLayers, {
  // bindToProj: 'EPSG:4326',
})
console.log(process.env.NODE_ENV)
console.dir(VueLayers)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})
