/* global Vue, VueLayers */
// noinspection ThisExpressionReferencesGlobalObjectJS
(function (window) {
  Vue.use(VueLayers)

  // noinspection ES6ConvertVarToLetConst
  var map = new Vue({
    el: '#map'
  })
}(this))
