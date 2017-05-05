<template>
  <div id="app">
    <header id="header">
      <nav class="nav">
        <div class="nav-left">
          <router-link to="/" exact-active-class="is-active" exact class="nav-item">
            {{ pkgName }}@{{ pkgVersion }}
          </router-link>

          <router-link to="/" exact-active-class="is-active" exact class="nav-item is-tab is-active">
            Home
          </router-link>

          <router-link to="/usage" exact-active-class="is-active" class="nav-item is-tab">
            Usage
          </router-link>
        </div>
        <div class="nav-center"></div>
        <div class="nav-right"></div>
      </nav>
    </header>

    <section id="content" class="section">
      <div class="columns">
        <div class="column is-2">
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
    </section>

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
