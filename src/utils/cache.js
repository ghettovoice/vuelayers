import coalesce from './coalesce'

export default class Cache {
  values = Object.create(null)

  set (key, value, ttl) {
    this.values[key] = value

    if (ttl != null) {
      setTimeout(() => {
        this.unset(key)
      }, ttl)
    }

    return this
  }

  get (key, def) {
    return coalesce(this.values[key], def)
  }

  unset (key) {
    delete this._cache[key]
  }
}
