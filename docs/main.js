import 'babel-polyfill'
import Buefy from 'buefy'
// noinspection JSFileReferences
import hljs from 'highlight.js'
import Vue from 'vue'
import VueProgressBar from 'vue-progressbar'
import VueAnalytics from 'vue-analytics'
import VueMarkdown from 'vue-markdown'
// import VueLayers modules
import VueLayers from 'vuelayers'
import App from './app.vue'
import DocsComponents from './components'
import router from './router'
import { preFilter } from './utils'

Vue.use(VueProgressBar, {
  color: 'C_PRIMARY_COLOR',
})
Vue.use(Buefy, {
  defaultIconPack: 'fa',
})
Vue.use(VueAnalytics, {
  id: 'C_GOOGLE_UID',
  router,
})
Vue.use(function (Vue) {
  Vue.component('vue-markdown', VueMarkdown)
})
// register all VueLayers components
Vue.use(VueLayers)
Vue.use(DocsComponents)

// taken from Buefy Docs Source
// see https://github.com/rafaelpimpa/buefy/blob/dev/docs/main.js
Vue.directive('highlight', {
  deep: true,
  bind (el, binding) {
    // On first bind, highlight all targets
    const targets = el.querySelectorAll('code')
    for (const target of targets) {
      // if a value is directly assigned to the directive, use this
      // instead of the element content.
      if (binding.value) {
        target.innerHTML = binding.value
      }
      target.innerHTML = preFilter(target.innerHTML)
      hljs.highlightBlock(target)
    }
  },
  componentUpdated (el, binding) {
    // After an update, re-fill the content and then highlight
    const targets = el.querySelectorAll('code')
    for (const target of targets) {
      if (binding.value) {
        target.innerHTML = preFilter(binding.value)
        hljs.highlightBlock(target)
      }
    }
  },
})

// taken from Buefy Docs Source
// see https://github.com/rafaelpimpa/buefy/blob/dev/docs/main.js
Vue.filter('pre', preFilter)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
})
