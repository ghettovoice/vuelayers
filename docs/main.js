import 'babel-polyfill'
import Vue from 'vue'
import Buefy from 'buefy'
// import VueLayers modules
import * as VueLayers from 'vuelayers'
import App from './app.vue'
import DocsComponents from './components'
import router from './router'

Vue.use(Buefy, {
  defaultIconPack: 'fa',
})
// register all VueLayers components
Vue.use(VueLayers)
Vue.use(DocsComponents)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
})
