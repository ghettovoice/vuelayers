import 'babel-polyfill'
import Vue from 'vue'
import Buefy from 'buefy'
// import VueLayers modules
import VueLayers from 'vuelayers'
import App from './app.vue'

Vue.use(Buefy, {
  defaultIconPack: 'fa',
})
// register all VueLayers components
Vue.use(VueLayers)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})
