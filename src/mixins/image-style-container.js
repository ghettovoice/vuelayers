import { Image } from 'ol/style'
import { assert, coalesce } from '../utils'

/**
 * @typedef {module:ol/style/Image~ImageStyle|Object|undefined} ImageStyleLike
 */

/**
 * @typedef {Object} ImageStyleTarget
 * @property {function(): module:ol/style/Image~ImageStyle|undefined} getImage
 * @property {function(module:ol/style/Image~ImageStyle|undefined): void} setImage
 */

/**
 * Image style container.
 */
export default {
  created () {
    this._image = undefined
    this._imageVm = undefined

    this::defineServices()
  },
  methods: {
    /**
     * @returns {{readonly imageStyleContainer: Object}}
     */
    getServices () {
      const vm = this

      return {
        get imageStyleContainer () { return vm },
      }
    },
    /**
     * @return {ImageStyleTarget|undefined}
     */
    getImageStyleTarget () {
      throw new Error(`${this.vmName} not implemented method: getImageStyleTarget()`)
    },
    /**
     * @returns {module:ol/style/Image~ImageStyle|undefined}
     */
    getImage () {
      return coalesce(this.getImageStyleTarget()?.getImage(), this._image)
    },
    /**
     * @return {Object}
     */
    getImageVm () {
      return this._imageVm
    },
    /**
     * @param {module:ol/style/Image~ImageStyle|undefined} image
     */
    setImage (image) {
      image = image?.$style || image
      image || (image = undefined)
      assert(!image || image instanceof Image, 'Invalid image style')

      const imageTarget = this.getImageStyleTarget()
      if (imageTarget && image !== imageTarget.getImage()) {
        imageTarget.setImage(image)
        this.scheduleRefresh()
      }
      if (image !== this._image) {
        this._image = image
        this._imageVm = image?.vm && image.vm[0]
        this.scheduleRefresh()
      }
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $image: {
      enumerable: true,
      get: this.getImage,
    },
    $imageVm: {
      enumerable: true,
      get: this.getImageVm,
    },
  })
}
