import '@babel/polyfill'
import Vue from 'vue'
import VueLayers from '../src'
import App from './app.vue'

const isProd = process.env.NODE_ENV === 'production'
Vue.config.silent = isProd
Vue.config.devtools = !isProd
Vue.config.performance = !isProd
Vue.config.productionTip = !isProd

Vue.use(VueLayers, {
  // dataProjection: 'EPSG:4326',
})
/* eslint-disable no-console */
console.log(process.env.NODE_ENV)
console.dir(VueLayers)
/* eslint-enable no-console */

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})
