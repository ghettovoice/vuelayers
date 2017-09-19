import * as Menu from './menu'
import * as Navbar from './navbar'
import DemoApp from './demo-app.vue'
import Footer from './footer.vue'
import GithubButton from './github-button.vue'
import Hero from './hero.vue'
import Sidebar from './sidebar.vue'
import Card from './card.vue'
import Code from './code.vue'

export default {
  install (Vue) {
    Object.keys(Menu).forEach(k => Vue.component(Menu[k].name, Menu[k]))
    Object.keys(Navbar).forEach(k => Vue.component(Navbar[k].name, Navbar[k]))
    Vue.component(DemoApp.name, DemoApp)
    Vue.component(Footer.name, Footer)
    Vue.component(GithubButton.name, GithubButton)
    Vue.component(Hero.name, Hero)
    Vue.component(Sidebar.name, Sidebar)
    Vue.component(Card.name, Card)
    Vue.component(Code.name, Code)
  },
}
