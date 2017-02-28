import Layer from './layer.vue'

Layer.install = function (Vue) {
  Vue.component(Layer.name, Layer)
}

export default Layer
