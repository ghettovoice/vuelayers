import Func from './style.vue'

export default {
  ...Func,
  install (Vue) {
    Vue.component(Func.name, Func)
  }
}
