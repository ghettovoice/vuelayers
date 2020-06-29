import Vue from 'vue'
import VueLayers from '@'
import App from './app.vue'

Vue.config.productionTip = false

Vue.use(VueLayers, {
  // dataProjection: 'EPSG:4326',
})
/* eslint-disable no-console */
console.log(process.env.NODE_ENV)
console.dir(VueLayers)
/* eslint-enable no-console */

/* eslint-disable no-new */
new Vue({
  render: h => h(App),
}).$mount('#app')
