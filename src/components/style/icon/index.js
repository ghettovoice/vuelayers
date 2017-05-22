import Icon from './style.vue'

export default {
  ...Icon,
  install (Vue) {
    Vue.component(Icon.name, Icon)
  }
}
