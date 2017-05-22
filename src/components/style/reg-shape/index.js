import RegShape from './style.vue'

export default {
  ...RegShape,
  install (Vue) {
    Vue.component(RegShape.name, RegShape)
  }
}
