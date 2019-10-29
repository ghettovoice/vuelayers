import { pick } from '../util/minilo'
import style from './style'

export default {
  mixins: [
    style,
  ],
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.vmId,
        class: this.vmClass,
      }
    },
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.$imageStyleContainer) {
        await this.$imageStyleContainer.setImage(this)
      }

      return this::style.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$imageStyleContainer) {
        await this.$imageStyleContainer.setImage(null)
      }

      return this::style.methods.unmount()
    },
    ...pick(style.methods, [
      'init',
      'deinit',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'getServices',
      'subscribeAll',
    ]),
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {Object|undefined}
     */
    $imageStyleContainer: {
      enumerable: true,
      get: () => this.$services?.imageStyleContainer,
    },
  })
}
