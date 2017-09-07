<template>
  <main id="app">
    <div class="columns is-gapless">
      <div class="column is-4-tablet is-3-desktop is-2-widescreen is-hidden-mobile">
        <vl-sidebar>
          <router-link slot="logo" to="/" title="C_PKG_FULLNAME.js Docs" exact-active-class="is-active">
            <div class="name">C_PKG_FULLNAME.js</div>
            <b-tag type="is-info">vC_PKG_VERSION</b-tag>
          </router-link>

          <a slot="links" href="C_PKG_REPOSITORY" title="View on GitHub" target="_blank">
            <b-icon icon="github" size="is-medium"/>
          </a>

          <vl-menu>
            <vl-menu-list label="General">
              <vl-menu-item v-for="item in generalMenuItems" :key="item.link">
                <router-link :to="item.link" :title="item.title" exact-active-class="is-active">
                  {{ item.title }}
                </router-link>
              </vl-menu-item>
            </vl-menu-list>

            <vl-menu-list v-for="item in groupedMenuItems" :key="item.title" :label="item.title">
              <vl-menu-item v-for="subitem in item.items" :key="subitem.link">
                <router-link :to="subitem.link" :title="subitem.title" exact-active-class="is-active">
                  {{ subitem.title }}
                </router-link>
              </vl-menu-item>
            </vl-menu-list>
          </vl-menu>
        </vl-sidebar>
      </div>

      <div class="column">
        <vl-navbar class="is-hidden-tablet">
          <vl-navbar-item slot="brand" link="/" title="C_PKG_FULLNAME.js Docs" class="logo has-text-left"
                          :router="true">
            <div class="name">C_PKG_FULLNAME.js</div>
            <b-tag type="is-info">vC_PKG_VERSION</b-tag>
          </vl-navbar-item>
          <vl-navbar-item slot="brand" link="C_PKG_REPOSITORY" title="View on GitHub" target="_blank"
                          class="is-hidden-desktop">
            <b-icon icon="github" size="is-medium" />
          </vl-navbar-item>

          <vl-navbar-item slot="start" v-for="item in generalMenuItems" :key="item.link" :router="true"
                          :link="item.link" :title="item.title">
            {{ item.title }}
          </vl-navbar-item>
          <vl-navbar-dropdown-item slot="start" v-for="item in groupedMenuItems" :key="item.link" :hover="true"
                                   :link="item.link" :router="true" :title="item.title">
            <span>{{ item.title }}</span>

            <vl-navbar-item slot="dropdown" v-for="subitem in item.items" :key="subitem.link" :router="true"
                            :link="subitem.link" :title="subitem.title">
              {{ subitem.title }}
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
          <b-icon icon="github"/>
          <span>GitHub</span>
        </a>
      </div>
    </vl-footer>
  </main>
</template>

<script>
  import { constant } from 'lodash/fp'
  import menu from './menu'
  import { Menu as VlMenu, List as VlMenuList, Item as VlMenuItem } from './components/menu'
  import {
    Navbar as VlNavbar,
    NavbarItem as VlNavbarItem,
    NavbarDropdownItem as VlNavbarDropdownItem,
  } from './components/navbar'
  import VlSidebar from './components/sidebar.vue'
  import VlFooter from './components/footer.vue'

  const computed = {
    menu: constant(menu),
    generalMenuItems () {
      return menu.filter(item => !item.items || !item.items.length)
    },
    groupedMenuItems () {
      return menu.filter(item => item.items && item.items.length)
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

  .navbar
    position: absolute
    top: 0
    left: 0
    right: 0
    z-index: 10
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4)
    .logo
      .name
        margin-right: .25em
</style>
