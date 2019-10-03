import '@babel/polyfill'
import Vue from 'vue'
import VueLayers from '@'
import App from './app.vue'

Vue.performance = true
Vue.productionTip = true

Vue.use(VueLayers, {
  // dataProjection: 'EPSG:4326',
})
console.log(process.env.NODE_ENV)
console.dir(VueLayers)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})
