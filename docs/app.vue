<template>
  <main id="app">
    <div class="columns">
      <aside id="left-sidebar" class="sidebar column is-one-quarter is-fullheight is-hidden-mobile">
        <div class="logo is-size-4-desktop">
          <router-link to="/" title="C_PKG_FULLNAME.js Docs">C_PKG_FULLNAME@C_PKG_VERSION</router-link>
        </div>
        <div class="links">
          <a href="C_PKG_HOMEPAGE" title="View on GitHub" target="_blank">
            <b-icon icon="github" size="is-medium"></b-icon>
          </a>
        </div>

        <v-menu>
          <v-menu-list v-for="group in menu" :key="group.title" :label="group.title">
            <v-menu-item v-for="item in group.items" :key="item.url">
              <router-link :to="item.url" :title="item.title">
                {{ item.title }}
              </router-link>
            </v-menu-item>
          </v-menu-list>
        </v-menu>
      </aside>

      <section id="page" class="page column">
        <div class="section">
          <router-view/>
        </div>
      </section>
    </div>

    <footer id="footer" class="footer">
    </footer>
  </main>
</template>

<script>
  import { Menu as VMenu, List as VMenuList, Item as VMenuItem } from './components/menu'

  const computed = {
    menu () {
      return this.$router.options.routes.reduce((all, route) => {
        if (route.meta && route.meta.group) {
          let group = all.find(g => g.title === route.meta.group)
          if (!group) {
            group = {
              title: route.meta.group,
              items: [],
            }
            all.push(group)
          }

          group.items.push({
            title: route.meta.title,
            url: route.path,
          })
        }

        return all
      }, [])
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
  @import ~highlight.js/styles/github-gist.css
  // import theme variables
  @import sass/variables
  // Import Bulma and Buefy styles
  @import ~bulma
  @import ~buefy/src/scss/buefy
  // import other
  @import sass/base

  // left sidebar
  #left-sidebar
    > *
      padding: .25em .75em
    /*.menu-label
      padding: 0 0.75em*/

  .logo
    text-align: center
    font-size: 1.2em

  .links
    text-align: center
    a
      color: $text-light
      &:hover
        color: $text
</style>
