/**
 * @module components/style/container
 * @deprecated
 */
import Container from './style.vue'

export default {
  ...Container,
  install (Vue) {
    Vue.component(Container.name, Container)
  }
}
