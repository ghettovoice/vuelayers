import View from './view.vue'

View.install = function (Vue) {
  Vue.component(View.name, View)
}

export default View
