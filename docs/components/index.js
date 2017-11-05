import * as Menu from './menu'
import * as Navbar from './navbar'
import Footer from './footer.vue'
import GithubButton from './github-button.vue'
import Hero from './hero.vue'
import Sidebar from './sidebar.vue'
import Card from './card.vue'
import Code from './code.vue'
import Markdown from './markdown.vue'
import CmpApi from './cmp-api.vue'
import Example from './example.vue'

export default {
  install (Vue) {
    Object.keys(Menu).forEach(k => Vue.component(Menu[k].name, Menu[k]))
    Object.keys(Navbar).forEach(k => Vue.component(Navbar[k].name, Navbar[k]))
    Vue.component(Footer.name, Footer)
    Vue.component(GithubButton.name, GithubButton)
    Vue.component(Hero.name, Hero)
    Vue.component(Sidebar.name, Sidebar)
    Vue.component(Card.name, Card)
    Vue.component(Code.name, Code)
    Vue.component(Markdown.name, Markdown)
    Vue.component(CmpApi.name, CmpApi)
    Vue.component(Example.name, Example)
  },
}
