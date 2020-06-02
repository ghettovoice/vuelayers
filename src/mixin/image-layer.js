import { pick } from '../util/minilo'
import layer from './layer'

export default {
  mixins: [
    layer,
  ],
  methods: {
    .../*#__PURE__*/pick(layer.methods, [
      'beforeInit',
      'init',
      'deinit',
      'beforeMount',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'subscribeAll',
      'getServices',
      'resolveOlObject',
      'resolveLayer',
    ]),
  },
}
