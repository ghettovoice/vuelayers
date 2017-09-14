<template>
  <main id="app">
    <div class="columns layout">
      <div class="column left is-4-tablet is-3-desktop is-2-widescreen is-hidden-mobile is-fullheight">
        <vld-sidebar>
          <router-link slot="logo" to="/" title="C_PKG_FULLNAME.js Home" exact-active-class="is-active">
            <div class="name">C_PKG_FULLNAME.js</div>
            <b-tag type="is-info">vC_PKG_VERSION</b-tag>
          </router-link>

          <a slot="links" href="C_PKG_REPOSITORY" title="View on GitHub" target="_blank" class="icon">
            <b-icon icon="github" size="is-medium"/>
          </a>

          <vld-menu>
            <vld-menu-list label="General">
              <vld-menu-item v-for="item in generalMenuItems" :key="item.link">
                <router-link :to="item.link" :title="item.title" exact-active-class="is-active">
                  {{ item.title }}
                </router-link>
              </vld-menu-item>
            </vld-menu-list>

            <vld-menu-list v-for="item in groupedMenuItems" :key="item.title" :label="item.title">
              <vld-menu-item v-for="subitem in item.items" :key="subitem.link">
                <router-link :to="subitem.link" :title="subitem.title" exact-active-class="is-active">
                  {{ subitem.title }}
                </router-link>
              </vld-menu-item>
            </vld-menu-list>
          </vld-menu>
        </vld-sidebar>
      </div>

      <div class="column center is-8-tablet is-9-desktop is-10-widescreen is-offset-4-tablet is-offset-3-desktop is-offset-2-widescreen">
        <vld-navbar class="is-hidden-tablet">
          <vld-navbar-item slot="brand" link="/" title="C_PKG_FULLNAME.js Docs" class="logo has-text-left"
                          :router="true">
            <div class="name">C_PKG_FULLNAME.js</div>
            <b-tag type="is-info">vC_PKG_VERSION</b-tag>
          </vld-navbar-item>
          <vld-navbar-item slot="brand" link="C_PKG_REPOSITORY" title="View on GitHub" target="_blank"
                          class="is-hidden-desktop">
            <b-icon icon="github" size="is-medium" />
          </vld-navbar-item>

          <vld-navbar-item slot="start" v-for="item in generalMenuItems" :key="item.link" :router="true"
                          :link="item.link" :title="item.title">
            {{ item.title }}
          </vld-navbar-item>
          <vld-navbar-dropdown-item slot="start" v-for="item in groupedMenuItems" :key="item.link" :hover="true"
                                   :link="item.link" :router="true" :title="item.title">
            <span>{{ item.title }}</span>

            <vld-navbar-item slot="dropdown" v-for="subitem in item.items" :key="subitem.link" :router="true"
                            :link="subitem.link" :title="subitem.title">
              {{ subitem.title }}
            </vld-navbar-item>
          </vld-navbar-dropdown-item>
        </vld-navbar>

        <div class="page">
          <router-view/>
        </div>

        <vld-footer id="footer" right-mods="has-text-centered has-text-right-tablet">
          <div slot="left">
            Licensed under <a href="C_PKG_LICENSE_URL" target="_blank" title="View license text">C_PKG_LICENSE_NAME</a>
            <br>
            &copy; {{ new Date().getFullYear() }} <a href="C_PKG_AUTHOR_HOMEPAGE" title="C_PKG_AUTHOR_NAME Homepage" target="_blank">C_PKG_AUTHOR_NAME</a>
          </div>

          <div slot="right">
            <a href="C_PKG_REPOSITORY" target="_blank" title="View on GitHub" class="button is-outlined is-info">
              <b-icon icon="github"/>
              <span>GitHub</span>
            </a>
          </div>
        </vld-footer>
      </div>
    </div>
  </main>
</template>

<script>
  import { constant } from 'lodash/fp'
  import menu from './menu'

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
    computed,
  }
</script>

<style lang="sass">
  // import all styles
  @import ./styles/main

  .layout
    margin: 0
    position: relative
    .left
      background: $sidebar-background
      padding: 0
      position: fixed
      a
        color: $sidebar-link-color
        &:hover
          color: $sidebar-link-hover-color
      .icon
        color: $sidebar-icon-color
        &:hover
          color: $sidebar-icon-hover-color
      .menu-list
        a
          color: $sidebar-menu-link-color
          &:hover
            background: $sidebar-menu-link-hover-background
            color: $sidebar-menu-link-hover-color
          &.is-active
            color: $sidebar-menu-link-active-color
            background: $sidebar-menu-link-active-background
    .center
      padding: 50px 0 0
      +tablet()
        padding-top: 0
    .page
      min-height: calc(100vh - 168px)

    .navbar
      position: fixed
      top: 0
      left: 0
      right: 0
      z-index: 10
      box-shadow: 0 0 1em rgba(0, 0, 0, 0.4)
      .logo
        .name
          margin-right: .25em
</style>
