<template>
  <div id="app">
    <header id="header">
      <nav class="nav has-shadow">
        <div class="container is-fluid">
          <div class="nav-left">
            <router-link :to="{ name: 'home' }" exact class="nav-item is-brand">{{ pkgName }}@{{ pkgVersion }}
            </router-link>
          </div>
          <div class="nav-center">
          </div>
          <div class="nav-right">
            <a :href="githubUrl" target="_blank" title="View on GitHub" class="nav-item">
            <span class="icon is-medium">
              <i class="fa fa-github"></i>
            </span>
            </a>
          </div>
        </div>
      </nav>
    </header>

    <div class="container is-fluid">
      <div class="columns">
        <div class="column is-2">
          <aside class="menu">
            <template v-for="cat in menu">
              <p class="menu-label">{{ cat.name }}</p>
              <ul class="menu-list">
                <li v-for="it in cat.items">
                  <router-link :to="it.path" active-class="is-active" :exact="it.exact">{{ it.props.title }}</router-link>
                </li>
              </ul>
            </template>
          </aside>
        </div>
        <div class="column">
          <main>
            <router-view/>
          </main>
          <footer id="footer" class="footer">
            <!--<div class="badges">
              <a v-for="badge in badges" :href="badge.url" :title="badge.title" target="_blank" class="badge">
                <img :src="badge.src" :alt="badge.title"/>
              </a>
            </div>-->
            <div class="columns">
              <div class="column">
                <div class="content">
                  <p>
                    <b>{{ pkgName }}</b> by
                    <a :href="homepageUrl" title="Vladimir Vershinin homepage" target="_blank">{{ pkgAuthor }}</a>
                  </p>
                  <p>
                    <small>Licensed under <a href="https://github.com/ghettovoice/vuelayers/blob/master/LICENSE"
                                             target="_blank" title="License text">MIT</a></small>
                    <br>
                    <small>&copy; {{ (new Date).getFullYear() }}  <a :href="homepageUrl"
                                                                     title="Vladimir Vershinin homepage"
                                                                     target="_blank">{{ pkgAuthor }}</a></small>
                  </p>
                </div>
              </div>
              <div class="column">
                <a class="github-button" href="https://github.com/ghettovoice/vuelayers" data-size="large"
                   data-show-count="true" aria-label="Star ghettovoice/vuelayers on GitHub">
                  Star
                </a>
                <a class="github-button" href="https://github.com/ghettovoice/vuelayers/archive/master.zip"
                   data-icon="octicon-cloud-download" data-size="large"
                   aria-label="Download ghettovoice/vuelayers on GitHub">
                  Download
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>

    <vue-progress-bar></vue-progress-bar>
  </div>
</template>

<script>
  /* global PKG_FULLNAME, PKG_VERSION, PKG_AUTHOR, PKG_GITHUB_URL, PKG_BADGES, MY_HOMEPAGE */
  import { constant } from 'lodash/fp'
  import routes from './routes'

  const computed = {
    pkgName: constant(PKG_FULLNAME + '.js'),
    pkgAuthor: constant(PKG_AUTHOR),
    pkgVersion: constant(PKG_VERSION),
    homepageUrl: constant(MY_HOMEPAGE),
    githubUrl: constant(PKG_GITHUB_URL),
    badges: constant(PKG_BADGES),
    menu: () => routes.reduce((all, r) => {
      if (!r.meta || !r.meta.category) return all

      const catName = r.meta.category
      if (!all[ catName ]) all[ catName ] = { name: catName, items: [] }

      const cat = all[ catName ]
      cat.items.push(r)

      return all
    }, {})
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

<style lang="scss">

  .badges {
    display   : flex;
    flex-flow : row wrap;
    margin    : 0 -.25rem;

    .badge {
      flex    : 0 1 auto;
      padding : 0.25rem;

      img {
        vertical-align : middle;
      }
    }
  }
</style>
