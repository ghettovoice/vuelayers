import Vue from 'vue'
import Buefy from 'buefy'
import ProgressBar from 'vue-progressbar'
import VueLayers from '../../src'
import App from './app.vue'
import router from './router'
import './scss/main.scss'

Vue.use(Buefy)
Vue.use(ProgressBar)
Vue.use(VueLayers)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router
})
