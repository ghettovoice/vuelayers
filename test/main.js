import Vue from 'vue'
import VueLayers from 'vuelayers'
import App from './app'

Vue.use(VueLayers)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
