import '@babel/polyfill'
import Vue from 'vue'
import Map from '../src/component/map'
import App from './app.vue'
import '../src/styles/main.scss'

Vue.performance = true
Vue.productionTip = true

Vue.use(Map, {
  // dataProjection: 'EPSG:4326',
})
console.log(process.env.NODE_ENV)
// console.dir(VueLayers)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})
