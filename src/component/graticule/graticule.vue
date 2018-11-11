<template>
  <i :class="$options.name" style="display: none !important;">
    <slot name="lon"></slot>
    <slot name="lat"></slot>
    <slot name="stroke"></slot>
  </i>
</template>

<script>
  import Vue from 'vue'
  import Graticule from 'ol/graticule'
  import { olCmp, useMapCmp, projTransforms } from '../../mixin'
  import { hasGraticule } from '../../util/assert'
  import { firstEl, map } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  const props = {
    maxLines: {
      type: Number,
      default: 100,
    },
    targetSize: {
      type: Number,
      default: 100,
    },
    showLabels: {
      type: Boolean,
      default: false,
    },
    lonLabelFormatter: Function,
    latLabelFormatter: Function,
    lonLabelPosition: {
      type: Number,
      default: 0,
    },
    latLabelPosition: {
      type: Number,
      default: 1,
    },
    intervals: {
      type: Array,
      default: () => [90, 45, 30, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.01, 0.005, 0.002, 0.001],
    },
  }

  const computed = {
    meridians () {
      if (!this.$graticule) return

      return map(this.getMeridians(), meridian => this.lineToDataProj(meridian.getCoordinates()))
    },
    parallels () {
      if (!this.$graticule) return

      return map(this.getParallels(), parallel => this.lineToDataProj(parallel.getCoordinates()))
    },
  }

  const methods = {
    createOlObject () {
      return new Graticule({
        maxLines: this.maxLines,
        targetSize: this.targetSize,
        showLabels: this.showLabels,
        strokeStyle: this._strokeStyle,
        lonLabelFormatter: this.lonLabelFormatter,
        latLabelFormatter: this.latLabelFormatter,
        lonLabelPosition: this.lonLabelPosition,
        latLabelPosition: this.latLabelPosition,
        lonLabelStyle: this._lonLabelStyle,
        latLabelStyle: this._latLabelStyle,
        intervals: this.intervals,
      })
    },
    /**
     * @return {Promise} Resolves when initialization completes
     * @protected
     */
    init () {
      return this::olCmp.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::olCmp.methods.deinit()
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      console.log(this.$graticule)
      this.$map && this.$graticule.setMap(this.$map)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$graticule.setMap(undefined)
    },
    getMeridians () {
      hasGraticule(this)

      return this.$graticule.getMeridians()
    },
    getParallels () {
      hasGraticule(this)

      return this.$graticule.getParallels()
    },
    setStroke (stroke) {
      stroke = stroke instanceof Vue ? stroke.$style : stroke

      if (stroke !== this._strokeStyle) {
        this._strokeStyle = stroke
        this.recreate()
      }
    },
    setText (text) {
      text = text instanceof Vue ? text.$style : text

      let vm
      const vmMatcher = vnode => vnode.componentInstance && vnode.componentInstance === vm

      if (text) {
        vm = firstEl(text[this.$options.VM_PROP])
      }

      switch (true) {
        case Array.isArray(this.$slots.lon) && this.$slots.lon.some(vmMatcher):
          if (text !== this._lonLabelStyle) {
            this._lonLabelStyle = text
            this.recreate()
          }
          break
        case Array.isArray(this.$slots.lat) && this.$slots.lat.some(vmMatcher):
          if (text !== this._latLabelStyle) {
            this._latLabelStyle = text
            this.recreate()
          }
          break
      }
    },
    getServices () {
      const vm = this

      return mergeDescriptors(this::olCmp.methods.getServices(), {
        get stylesContainer () { return vm },
      })
    },
  }

  const watch = makeWatchers(Object.keys(props), function () {
    this.recreate()
  })

  export default {
    name: 'vl-graticule',
    mixins: [olCmp, useMapCmp, projTransforms],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          class: this.$options.name,
        }
      },
    },
    created () {
      Object.defineProperties(this, {
        $graticule: {
          enumerable: true,
          get: () => this.$olObject,
        },
        $map: {
          enumerable: true,
          get: () => this.$services && this.$services.map,
        },
        $view: {
          enumerable: true,
          get: () => this.$services && this.$services.view,
        },
      })
    },
  }
</script>
