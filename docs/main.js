import 'babel-polyfill'
import Vue from 'vue'
import Buefy from 'buefy'
// import C_PKG_FULLNAME modules
import * as VueLayers from 'vuelayers'
import App from './app.vue'
import DocsComponents from './components'
import router from './router'

Vue.use(Buefy, {
  defaultIconPack: 'fa',
})
// register all C_PKG_FULLNAME components
Vue.use(VueLayers)
Vue.use(DocsComponents)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
})
