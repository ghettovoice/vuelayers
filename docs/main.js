import 'babel-polyfill'
import Vue from 'vue'
import Buefy from 'buefy'
import VueLayers from '../src'
import App from './app.vue'
import router from './router'

Vue.use(Buefy)
Vue.use(VueLayers)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
})
