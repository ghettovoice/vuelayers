import debounce from 'debounce-promise'
import mergeDescriptors from '../util/multi-merge-descriptors'
import { makeWatchers } from '../util/vue-helpers'
import featuresContainer from './features-container'
import projTransforms from './proj-transforms'
import source from './source'

export default {
  mixins: [source, featuresContainer, projTransforms],
  props: {
    useSpatialIndex: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    /**
     * @return {void}
     */
    clear () {
      this::featuresContainer.methods.clearFeatures()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::source.methods.getServices(),
        this::featuresContainer.methods.getServices(),
      )
    },
    /**
     * @return {Promise}
     * @protected
     */
    init () {
      return this::source.methods.init()
    },
    /**
     * @return {void|Promise<void>}
     * @protected
     */
    deinit () {
      return this::source.methods.deinit()
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      return this::source.methods.mount()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.clear()
      return this::source.methods.unmount()
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::source.methods.subscribeAll()
    },
    /**
     * @param feature
     * @return {ReadonlyArray<any>}
     * @protected
     */
    writeFeatureInDataProj (feature) {
      return this::projTransforms.methods.writeFeatureInDataProj(feature)
    },
    /**
     * @param feature
     * @return {ReadonlyArray<any>}
     * @protected
     */
    writeGeometryInViewProj (feature) {
      return this::projTransforms.methods.writeFeatureInViewProj(feature)
    },
  },
  watch: {
    featuresDataProj: {
      deep: true,
      handler: debounce(function (features) {
        this.$emit('update:features', features.slice())
      }, 1000 / 60),
    },
    ...makeWatchers([
      'useSpatialIndex',
    ], () => function () {
      return this.scheduleRecreate()
    }),
  },
  stubVNode: {
    empty: false,
    attrs () {
      return {
        id: this.vmId,
        class: this.cmpName,
      }
    },
  },
}
