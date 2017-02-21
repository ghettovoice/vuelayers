import Vue from 'vue'
import VueLayers from '../src'
import App from './App'

Vue.use(VueLayers)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
