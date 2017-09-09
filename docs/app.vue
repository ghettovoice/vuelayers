<template>
  <main id="app">
    <div class="columns is-gapless layout">
      <div class="column left is-4-tablet is-3-desktop is-2-widescreen is-hidden-mobile is-fullheight">
        <vld-sidebar>
          <router-link slot="logo" to="/" title="C_PKG_FULLNAME.js Docs" exact-active-class="is-active">
            <div class="name">C_PKG_FULLNAME.js</div>
            <b-tag type="is-info">vC_PKG_VERSION</b-tag>
          </router-link>

          <a slot="links" href="C_PKG_REPOSITORY" title="View on GitHub" target="_blank">
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

      <div class="column center is-8-tablet is-9-desktop is-10-widescreen">
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
            &copy; 2016-{{ new Date().getFullYear() }} <a href="C_PKG_AUTHOR_HOMEPAGE" title="C_PKG_AUTHOR_NAME Homepage" target="_blank">C_PKG_AUTHOR_NAME</a>
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
  // import base
  @import sass/base

  .layout
    margin-bottom: 0 !important
    .left
      background: $dark
      a
        &:hover
          color: $primary-invert
      .menu-list
        a
          color: $primary
          &:hover
            background: lighten($dark, 10%)
            color: $primary-invert
          &.is-active
            color: $primary-invert
            background: $primary
    .page
      min-height: calc(100% - 168px)

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
