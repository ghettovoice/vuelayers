<template>
  <div class="home">
    <section class="map">
      <vl-map ref="map" :def-controls="false" :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
        <vl-view ref="view" :zoom="3" :min-zoom="2"/>

        <vl-geoloc @update:position="onUpdatePosition">
          <template scope="ctx">
            <vl-feature v-if="ctx.position" id="position-feature">
              <vl-geom-point :coordinates="ctx.position"/>
              <vl-style-box>
                <vl-style-icon src="../static/img/marker.png" :scale="0.4" :anchor="[0.5, 1]"/>
              </vl-style-box>
            </vl-feature>
          </template>
        </vl-geoloc>

        <vl-layer-tile>
          <vl-source-sputnik/>
        </vl-layer-tile>
      </vl-map>
    </section>

    <vld-hero>
      <vld-home-content class="intro"/>

      <section class="buttons">
        <router-link to="/demo" class="button is-primary is-large" title="View Live Demo">
          <b-icon icon="gear"></b-icon>
          <span>Live Demo</span>
        </router-link>
        <router-link to="/start" class="button is-success is-large" title="Quick Start Guide">
          <span>Get started</span>
          <b-icon icon="arrow-right"></b-icon>
        </router-link>
      </section>

      <hr/>

      <section class="github-buttons is-flex is-flex-justify-center">
        <vld-github-btn user="C_PKG_AUTHOR_USER" repo="C_PKG_NAME" type="star" :count="true"
                       size="large" width="120px"
                       height="30px"/>
        <vld-github-btn user="C_PKG_AUTHOR_USER" repo="C_PKG_NAME" type="fork" :count="true"
                       size="large" width="120px"
                       height="30px"/>
      </section>
    </vld-hero>
  </div>
</template>

<script>
  import { core as vlCore } from 'vuelayers'
  import VldHomeContent from '../md/home.md'

  const methods = {
    onUpdatePosition (coordinate) {
      if (!this.zoomedToPosition) {
        this.zoomedToPosition = true
        this.$refs.view.animate({
          center: vlCore.projHelper.fromLonLat(coordinate, this.$refs.view.projection),
          zoom: 12,
          duration: 1000,
        })
      }
    },
  }

  export default {
    name: 'vld-home-page',
    components: {
      VldHomeContent,
    },
    methods,
    data () {
      return {
        zoomedToPosition: false,
      }
    },
  }
</script>

<style lang="sass">
  @import ../styles/variables

  .home
    .map
      height: 40vh

    .intro
      text-align: center
      margin: 0 auto
      +desktop()
        max-width: 30em

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
