import Vue from 'vue'
import VueLayers from '../src'
import App from './app.vue'

Vue.vuelayers = {
  serviceContainerKey: 'qwerty'
}
Vue.use(VueLayers)
console.log(VueLayers)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
