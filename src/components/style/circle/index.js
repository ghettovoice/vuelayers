import Circle from './circle.vue'

Circle.install = function (Vue) {
  Vue.component(Circle.name, Circle)
}

export default Circle
