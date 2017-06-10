export default class IdentityMap {
  map = Object.create(null)

  set (id, object) {
    this.map[id] = {
      object,
      refs: 0
    }
  }

  get (id) {
    const rec = this.map[id] || {}
    if (!rec || !rec.value == null) return

    rec.refs++
    this.map[id] = rec

    return rec.object
  }

  unset (id) {
    const rec = this.map[id]
    if (!rec || !rec.value == null) return

    rec.refs--
    if (rec.refs === 0) {
      delete this.map[id]
    } else {
      this.map[id] = rec
    }
  }

  has (id) {
    return !!this.map[id]
  }
}
