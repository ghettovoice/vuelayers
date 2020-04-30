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
  methods: {
    /**
     * @return {ImageStyleTarget}
     */
    getImageStyleTarget () {
      throw new Error('Not implemented method: getImageStyleTarget')
    },
    /**
     * @returns {Promise<module:ol/style/Image~ImageStyle|undefined>}
     */
    async getImage () {
      return (await this.getImageStyleTarget()).getImage()
    },
    /**
     * @param {module:ol/style/Image~ImageStyle|undefined} image
     * @returns {Promise<void>}
     */
    async setImage (image) {
      if (image && isFunction(image.resolveOlObject)) {
        image = await image.resolveOlObject()
      }

      const imageTarget = await this.getImageStyleTarget()
      if (imageTarget && image !== imageTarget.getImage()) {
        imageTarget.setImage(image)
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
