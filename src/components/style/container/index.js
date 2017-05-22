/**
 * @module components/style/container
 */
import Container from './style.vue'

export default {
  ...Container,
  install (Vue) {
    Vue.component(Container.name, Container)
  }
}
