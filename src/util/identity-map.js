/**
 * Simple Identity map with refs count
 */
export default class IdentityMap {
  _pools = Object.create(null)

  /**
   * @param {string} pool
   * @private
   */
  _preparePool (pool) {
    this._pools[pool] || (this._pools[pool] = Object.create(null))
  }

  /**
   * @param {string} id
   * @param {*} value
   * @param {string} pool
   */
  set (id, value, pool = 'default') {
    if (value == null) return

    this._preparePool(pool)

    this._pools[pool][id] = {
      value,
      refs: 1,
    }
  }

  /**
   * @param {string} id
   * @param {string} pool
   */
  get (id, pool = 'default') {
    this._preparePool(pool)

    let rec = this._pools[pool][id]
    if (!rec || rec.value == null) return

    rec.refs++
    this._pools[pool][id] = rec

    return rec.value
  }

  /**
   * @param {string} id
   * @param {string} pool
   */
  unset (id, pool = 'default') {
    this._preparePool(pool)

    let rec = this._pools[pool][id]
    if (!rec || rec.value == null) return

    rec.refs--
    if (rec.refs === 0) {
      delete this._pools[pool][id]
    }
  }

  /**
   * @param {string} id
   * @param {string} pool
   * @return {boolean}
   */
  has (id, pool = 'default') {
    this._preparePool(pool)

    return !!this._pools[pool][id]
  }

  /**
   * @param {string} pool
   * @return {string[]}
   */
  ids (pool = 'default') {
    this._preparePool(pool)

    return Object.keys(this._pools[pool])
  }

  /**
   * @param {string} id
   * @param {string} pool
   * @return {*}
   */
  refs (id, pool = 'default') {
    this._preparePool(pool)

    return this.has(id, pool) ? this._pools[pool][id].refs : undefined
  }
}
