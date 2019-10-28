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
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.$stylesContainer) {
        await this.$stylesContainer.setImage(this)
      }

      return this::style.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$stylesContainer) {
        await this.$stylesContainer.setImage(null)
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
