import Cache from '../utils/cache'
import { CACHE_PROP } from '../consts'

export default {
  created () {
    // todo нужен кеш ol объектов с подсчётом ссылок, чтобы удалять ol объект когда нигде больше не используется
    if (!this.$root[CACHE_PROP]) {
      this.$root[CACHE_PROP] = new Cache()
    }
  },
  methods: {
    shareValue (key, value) {
      this.cache.set(key, { value, refs: 0 })
      this.getSharedValue(key)
    },
    getSharedValue (key) {
      const rec = this.cache.get(key, {})
      if (!rec || !rec.value == null) return

      rec.refs++
      this.cache.set(key, rec)

      return rec.value
    },
    unshareValue (key) {
      const rec = this.cache.get(key)
      if (!rec || !rec.value == null) return

      rec.refs--
      if (rec.refs === 0) {
        this.cache.unset(key)
      } else {
        this.cache.set(key, rec)
      }
    }
  }
}
