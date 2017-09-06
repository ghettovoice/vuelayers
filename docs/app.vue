<template>
  <main id="app">
    <div class="columns is-gapless">
      <div class="column is-one-third-tablet is-one-quarter-desktop is-hidden-mobile">
        <vl-sidebar>
          <router-link slot="logo" to="/" title="C_PKG_FULLNAME.js Docs">C_PKG_FULLNAME@C_PKG_VERSION</router-link>

          <a slot="links" href="C_PKG_REPOSITORY" title="View on GitHub" target="_blank">
            <b-icon icon="github" size="is-medium"></b-icon>
          </a>

          <vl-menu>
            <vl-menu-list v-for="group in menu" :key="group.title" :label="group.title">
              <vl-menu-item v-for="item in group.items" :key="item.url">
                <router-link :to="item.url" :title="item.title">
                  {{ item.title }}
                </router-link>
              </vl-menu-item>
            </vl-menu-list>
          </vl-menu>
        </vl-sidebar>
      </div>

      <div class="column">
        <router-view/>
      </div>
    </div>


    <vl-footer id="footer" right-mods="has-text-centered has-text-right-tablet">
      <div slot="left">
        Licensed under <a href="C_PKG_LICENSE_URL" target="_blank" title="View license text">C_PKG_LICENSE_NAME</a>
        <br>
        &copy; 2016-{{ new Date().getFullYear() }} <a href="C_PKG_AUTHOR_HOMEPAGE" title="C_PKG_AUTHOR_NAME Homepage" target="_blank">C_PKG_AUTHOR_NAME</a>
      </div>

      <div slot="right">
        <a href="C_PKG_REPOSITORY" target="_blank" title="View on GitHub" class="button is-outlined is-info">
          <b-icon icon="github"></b-icon>
          <span>GitHub</span>
        </a>
      </div>
    </vl-footer>
  </main>
</template>

<script>
  import { Menu as VlMenu, List as VlMenuList, Item as VlMenuItem } from './components/menu'
  import VlSidebar from './components/sidebar.vue'
  import VlFooter from './components/footer.vue'

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
      VlMenu,
      VlMenuList,
      VlMenuItem,
      VlSidebar,
      VlFooter,
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
</style>
