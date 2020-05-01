import { isFunction } from '../util/minilo'

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
     * @return {ImageStyleTarget}
     */
    getImageStyleTarget () {
      throw new Error('Not implemented method: getImageStyleTarget')
    },
    /**
     * @returns {module:ol/style/Image~ImageStyle|undefined}
     */
    getImage () {
      return this._image
    },
    /**
     * @param {module:ol/style/Image~ImageStyle|undefined} image
     * @returns {Promise<void>}
     */
    async setImage (image) {
      let imageVm
      if (image && isFunction(image.resolveOlObject)) {
        imageVm = image
        image = await image.resolveOlObject()
      }

      const imageTarget = await this.getImageStyleTarget()
      if (imageTarget && image !== imageTarget.getImage()) {
        imageTarget.setImage(image)
        this._image = image
        this._imageVm = imageVm || (image?.vm && image.vm[0])
      }
    },
    /**
     * @returns {{readonly imageStyleContainer: Object}}
     */
    getServices () {
      const vm = this

      return {
        get imageStyleContainer () { return vm },
      }
    },
  },
}

function defineServices () {
  Object.defineProperties(this, {
    $image: {
      enumerable: true,
      get: this.getStroke,
    },
    $imageVm: {
      enumerable: true,
      get: () => this._imageVm,
    },
  })
}
