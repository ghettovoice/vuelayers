import 'babel-polyfill'
import Vue from 'vue'
import VueLayers from '../src'
import App from './app.vue'
import VueProgress from 'vue-progress'

Vue.use(VueProgress)
Vue.use(VueLayers)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
