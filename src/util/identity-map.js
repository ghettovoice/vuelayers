/**
 * Simple Identity map with refs count
 */
export default class IdentityMap {
  map = Object.create(null)

  set (id, value) {
    if (value == null) return

    this.map[id] = {
      value,
      refs: 1,
    }
  }

  get (id) {
    let rec = this.map[id]
    if (!rec || rec.value == null) return

    rec.refs++
    this.map[id] = rec

    return rec.value
  }

  unset (id) {
    let rec = this.map[id]
    if (!rec || rec.value == null) return

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

  ids () {
    return Object.keys(this.map)
  }

  refs (id) {
    return this.has(id) ? this.map[id].refs : undefined
  }
}
