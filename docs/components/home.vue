<template>
  <div class="home">
    <section class="map">
      <vl-map :def-controls="false" ref="map">
        <vl-view :zoom="3" :min-zoom="2"/>

        <vl-geoloc>
          <template scope="ctx">
            <vl-feature v-if="ctx.position" id="position-feature">
              <vl-geom-point :coordinates="ctx.position"/>
              <vl-style-box>
                <vl-style-icon src="../static/marker.png" :scale="0.4" :anchor="[0.5, 1]"/>
              </vl-style-box>
            </vl-feature>
          </template>
        </vl-geoloc>

        <vl-layer-tile>
          <vl-source-sputnik/>
        </vl-layer-tile>
      </vl-map>
    </section>

    <section class="hero">
      <div class="hero-body">
        <vl-home-page/>

        <section class="buttons">
          <a class="button is-success is-large"
             href="C_PKG_REPOSITORY/archive/C_PKG_VERSION.zip"
             title="Download latest version"
             target="_blank">
            <b-icon icon="download"></b-icon>
            <span>Download</span>
          </a>

          <router-link to="/usage" class="button is-primary is-large" title="Usage guide">
            <span>Get started</span>
            <b-icon icon="arrow-right"></b-icon>
          </router-link>
        </section>

        <hr/>

        <section class="github-buttons is-flex is-flex-justify-center">
          <vl-github-btn user="C_PKG_AUTHOR_USER" repo="C_PKG_NAME" type="star" :count="true"
                         size="large" width="120px"
                         height="30px"/>
          <vl-github-btn user="C_PKG_AUTHOR_USER" repo="C_PKG_NAME" type="fork" :count="true"
                         size="large" width="120px"
                         height="30px"/>
        </section>
      </div>
    </section>
  </div>
</template>

<script>
  import VlHomePage from '../md/partial/home.md'
  import VlGithubBtn from './github-button.vue'

  export default {
    name: 'vl-home',
    components: {
      VlHomePage,
      VlGithubBtn,
    },
  }
</script>

<style lang="sass">
  @import ../sass/variables

  .home
    .map
      height: 40vh

    .buttons
      margin: .5rem 0
      .button
        margin: .25rem 0
        display: flex
        &:first-child
          margin-top: 0
        &:last-child
          margin-bottom: 0
      +tablet()
        display: flex
        justify-content: center
        .button
          margin: 0 .25rem
          &:first-child
            margin-left: 0
          &:last-child
            margin-right: 0

    .github-buttons
      margin: .5rem 0
      display: flex
      justify-content: center
      .github-button
        margin: 0 .25em
        display: flex
        &:first-child
          margin-left: 0
        &:last-child
          margin-right: 0
</style>
