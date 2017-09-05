<template>
  <main id="app">
    <div class="columns">
      <aside id="left-sidebar" class="is-left column is-one-quarter">
        <v-menu>
          <template v-for="item in menu">
            <v-menu-list></v-menu-list>
          </template>
        </v-menu>
      </aside>

      <section id="page" class="page column">
        <router-view/>
      </section>
    </div>

    <footer id="footer" class="footer">
    </footer>
  </main>
</template>

<script>
  import { Menu as VMenu, List as VMenuList, Item as VMenuItem } from './components/menu'
  import { trimCharsStart, trimCharsEnd } from 'lodash/fp'
  import routes from './routes'

  const computed = {
    menu () {
      const routesToMenu = (routes, baseUrl = '') => routes.reduce((items, route) => {
        if (route.meta && route.meta.menu) {
          let url = [trimCharsEnd('/', baseUrl), trimCharsStart('/', route.path)].join('/')
          let item = {
            title: route.meta.title,
            url,
          }

          if (route.children) {
            item.children = (item.children || []).concat(routesToMenu(route.children, url))
          }
          if (route.routes) {
            item.children = (item.children || []).concat(routesToMenu(route.routes))
          }

          items.push(item)
        }

        return items
      }, [])

      return routesToMenu(routes)
    },
  }

  export default {
    name: 'app',
    components: {
      VMenu,
      VMenuList,
      VMenuItem,
    },
    computed,
  }
</script>

<style lang="sass">
  /*! VueLayers.js site */
  // import theme variables
  @import sass/variables
  // Import Bulma and Buefy styles
  @import ~bulma
  @import ~buefy/src/scss/buefy
  // import other
  @import sass/base
</style>
