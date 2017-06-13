import { Observable } from 'rxjs'
import Cluster from 'ol/source/cluster'
import * as assert from '../../../utils/assert'

export default class Builder {
  /**
   * @param value
   * @returns {Builder}
   */
  setAttributions (value) {
    this.attributions = value
    return this
  }

  /**
   * @param value
   * @returns {Builder}
   */
  setDistance (value) {
    this.distance = value
    return this
  }

  /**
   * @param value
   * @returns {Builder}
   */
  setGeometryFunction (value) {
    this.geometryFunction = value
    return this
  }

  /**
   * @param value
   * @returns {Builder}
   */
  setLogo (value) {
    this.logo = value
    return this
  }

  /**
   * @param value
   * @returns {Builder}
   */
  setProjection (value) {
    this.projection = value
    return this
  }

  /**
   * @param value
   * @returns {Builder}
   */
  setSource (value) {
    this.source = value
    return this
  }

  /**
   * @param value
   * @returns {Builder}
   */
  setWrapX (value) {
    this.wrapX = value
    return this
  }

  /**
   * @param key
   * @param value
   * @return {void}
   */
  set (key, value) {
    this.values || (this.values = {})
    this.values[key] = value
  }

  /**
   * @return {ol.source.Cluster}
   */
  build () {
    assert.ok(this.source, 'source is provided')

    const source = new Cluster({
      attributions: this.attributions,
      distance: this.distance,
      geometryFunction: this.geometryFunction,
      logo: this.logo,
      projection: this.projection,
      source: this.source,
      wrapX: this.wrapX
    })
    source.setProperties(this.values)

    return source
  }

  /**
   * @return {Promise<ol.source.Cluster>}
   */
  promise () {
    return Observable.interval(100)
      .skipWhile(() => !this.source)
      .first()
      .map(::this.build)
      .toPromise()
  }
}
