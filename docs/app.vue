<template lang="pug">
  main#app(:class="[$options.name]")
    div.columns.layout
      div.column.left.is-4-tablet.is-3-desktop.is-2-widescreen.is-hidden-mobile.is-fullheight
        vld-sidebar
          router-link(slot="logo", to="/", title="C_PKG_FULLNAME.js Home", exact-active-class="is-active")
            div.name.
              #[b-icon(icon="map-o")] #[span C_PKG_FULLNAME]
            b-tag(type="is-info") vC_PKG_VERSION

          a.icon(slot="links", href="C_PKG_REPOSITORY", title="View on GitHub", target="_blank")
            b-icon(icon="github", size="is-medium")/

          vld-menu
            vld-menu-list(label="General")
              vld-menu-item(v-for="item in generalMenuItems", :key="item.link")
                router-link(:to="item.link", :title="item.title" exact-active-class="is-active") {{ item.title }}

            vld-menu-list(v-for="item in groupedMenuItems", :key="item.title", :label="item.title")
              vld-menu-item(v-for="subitem in item.items", :key="subitem.link")
                router-link(:to="subitem.link", :title="subitem.title" exact-active-class="is-active") {{ subitem.title }}

      div.column.center.is-8-tablet.is-9-desktop.is-10-widescreen.is-offset-4-tablet.is-offset-3-desktop.is-offset-2-widescreen
        vld-navbar.is-hidden-tablet
          vld-navbar-item.logo.has-text-left(slot="brand" link="/" title="C_PKG_FULLNAME.js Docs", :router="true")
            div.name.
              #[b-icon(icon="map-o")] #[span C_PKG_FULLNAME]
            b-tag(type="is-info") vC_PKG_VERSION
          vld-navbar-item.is-hidden-desktop(slot="brand" link="C_PKG_REPOSITORY" title="View on GitHub" target="_blank")
            b-icon(icon="github" size="is-medium")/

          vld-navbar-item(
            slot="start"
            v-for="item in generalMenuItems"
            ':key'="item.link"
            ':router'="true"
            ':link'="item.link"
            ':title'="item.title"
          ) {{ item.title }}
          vld-navbar-dropdown-item(
            slot="start"
            v-for="item in groupedMenuItems"
            ':key'="item.link"
            ':hover'="true"
            ':link'="item.link"
            ':router'="true"
            ':title'="item.title"
          )
            span {{ item.title }}

            vld-navbar-item(
              slot="dropdown"
              v-for="subitem in item.items"
              ':key'="subitem.link"
              ':router'="true"
              ':link'="subitem.link"
              ':title'="subitem.title"
            ) {{ subitem.title }}

        div.page
          transition(name="fade-delayed" appear)
            router-view/

        vld-footer#footer(right-mods="has-text-centered has-text-right-tablet")
          div(slot="left").
            Licensed under #[a(href="C_PKG_LICENSE_URL" target="_blank" title="View license text") C_PKG_LICENSE_NAME]
            #[br]
            &copy; {{ new Date().getFullYear() }} #[a(href="C_PKG_AUTHOR_HOMEPAGE" title="C_PKG_AUTHOR_NAME Homepage" target="_blank") C_PKG_AUTHOR_NAME]

          div(slot="right")
            a.button.is-outlined.is-info(href="C_PKG_REPOSITORY" target="_blank" title="View on GitHub")
              b-icon(icon="github")/
              span GitHub
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
    name: 'vld-app',
    computed,
  }
</script>

<style lang="sass">
  // import all styles
  @import ./styles/main

  .vld-app
    .layout
      margin: 0
      position: relative
      .left
        background: $sidebar-background
        padding: 0
        position: fixed
        .icon
          color: $sidebar-icon-color
          &:hover
            color: $sidebar-icon-hover-color
        .logo
          color: $white
          a, .icon
            color: $white
            &:hover, &:hover .icon
              color: $primary
          .name
            font-size: 1.5em
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
            margin-right: .5em
            vertical-align: middle
</style>
