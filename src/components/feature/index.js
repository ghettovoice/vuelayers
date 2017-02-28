import Feature from './feature.vue'

Feature.install = function (Vue) {
  Vue.component(Feature.name, Feature)
}

export default Feature
