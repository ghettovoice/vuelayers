<template>
  <main id="app">
    <div class="columns is-gapless">
      <div class="column is-one-third-tablet is-one-quarter-desktop is-hidden-mobile">
        <vl-sidebar>
          <router-link slot="logo" to="/" title="C_PKG_FULLNAME.js Docs" exact-active-class="is-active">
            C_PKG_FULLNAME.js<br/>
            <small>vC_PKG_VERSION</small>
          </router-link>

          <a slot="links" href="C_PKG_REPOSITORY" title="View on GitHub" target="_blank">
            <b-icon icon="github" size="is-medium"></b-icon>
          </a>

          <vl-menu>
            <vl-menu-list v-for="group in desktopMenu" :key="group.title" :label="group.title">
              <vl-menu-item v-for="item in group.items" :key="item.url">
                <router-link :to="item.url" :title="item.title" exact-active-class="is-active">
                  {{ item.title }}
                </router-link>
              </vl-menu-item>
            </vl-menu-list>
          </vl-menu>
        </vl-sidebar>
      </div>

      <div class="column">
        <vl-navbar>
          <vl-navbar-item slot="brand" link="/" title="C_PKG_FULLNAME.js Docs" class="logo" :router="true">
            C_PKG_FULLNAME.js<br/>
            <small>vC_PKG_VERSION</small>
          </vl-navbar-item>
          <vl-navbar-item slot="brand" link="C_PKG_REPOSITORY" title="View on GitHub" target="_blank"
                          class="is-hidden-desktop">
            <b-icon icon="github" size="is-medium"></b-icon>
          </vl-navbar-item>

          <vl-navbar-dropdown-item slot="left" v-for="group in mobileMenu" :key="group.title" :hover="true"
                                   :link="group.url" :router="true" :title="group.title">
            <span>{{ group.title }}</span>

            <vl-navbar-item slot="dropdown" v-for="item in group.items" :key="item.url" :router="true" :link="item.url"
                            :title="item.title">
              {{ item.title }}
            </vl-navbar-item>
          </vl-navbar-dropdown-item>
        </vl-navbar>

        <div class="page">
          <router-view/>
        </div>
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
  import {
    Navbar as VlNavbar,
    NavbarItem as VlNavbarItem,
    NavbarDropdownItem as VlNavbarDropdownItem,
  } from './components/navbar'
  import VlSidebar from './components/sidebar.vue'
  import VlFooter from './components/footer.vue'

  const computed = {
    desktopMenu () {
      return this.$router.options.routes.reduce((all, route) => {
        if (route.meta && route.meta.desktopMenuGroup) {
          let group = all.find(g => g.title === route.meta.desktopMenuGroup)
          if (!group) {
            group = {
              title: route.meta.desktopMenuGroup,
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
    mobileMenu () {
      const waitingItems = {}

      return this.$router.options.routes.reduce((all, route) => {
        if (route.meta && route.meta.mobileMenuGroup) {
          let group
          if (route.meta.mobileMenuIndex) {
            all.push({
              title: route.meta.mobileMenuGroup,
              url: route.path,
              items: (waitingItems[route.meta.mobileMenuGroup] || []),
            })
            delete waitingItems[route.meta.mobileMenuGroup]
          } else {
            group = all.find(x => x.title === route.meta.mobileMenuGroup)
            if (group) {
              group.items.push({
                title: route.meta.title,
                url: route.path,
              })
            } else {
              waitingItems[route.meta.mobileMenuGroup] = (waitingItems[route.meta.mobileMenuGroup] || []).push({
                title: route.meta.title,
                url: route.path,
              })
            }
          }
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
      VlNavbar,
      VlNavbarItem,
      VlNavbarDropdownItem,
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
