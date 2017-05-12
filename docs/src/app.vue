<template>
  <div id="app">
    <header id="header">
      <nav class="nav">
        <div class="nav-left">
          render dynamically from routes
        </div>
        <div class="nav-center"></div>
        <div class="nav-right"></div>
      </nav>
    </header>

    <main id="content">
      <div class="columns">
        <div class="column is-2">
          render dynamically from routes
          <aside class="menu">
            <p class="menu-label">Components</p>
            <ul class="menu-list">
              <li>
                <router-link to="/components/map" active-class="is-active">vl-map</router-link>
              </li>
            </ul>
          </aside>
        </div>
        <div class="column">
          <router-view></router-view>
        </div>
      </div>
    </main>

    <footer id="footer" class="footer">

    </footer>

    <vue-progress-bar></vue-progress-bar>
  </div>
</template>

<script>
  /* global PKG_FULLNAME, PKG_VERSION */
  import { constant } from 'lodash/fp'

  const computed = {
    pkgName: constant(PKG_FULLNAME),
    pkgVersion: constant(PKG_VERSION)
  }

  export default {
    name: 'app',
    computed,
    created () {
      this.$Progress.start()
      this.$router.beforeEach((to, from, next) => {
        this.$Progress.start()
        next()
      })
      this.$router.afterEach(() => {
        this.$Progress.finish()
      })
    },
    mounted () {
      this.$Progress.finish()
    }
  }
</script>

<style></style>
