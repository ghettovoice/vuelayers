import debounce from 'debounce-promise'
import { getSourceId } from '../ol-ext'
import { isFunction, lowerFirst, upperFirst } from '../util/minilo'
import { FRAME_TIME } from './ol-cmp'

/**
 * @typedef {module:ol/source/Source~Source|Object} SourceLike
 */
/**
 * @typedef {Object} SourceTarget
 * @property {function(module:ol/source/Source~Source): void} setSource
 * @property {function(): module:ol/source/Source~Source} getSource
 */

export function createSourceContainer (options = {}) {
  options = {
    propName: 'source',
    serviceName: 'source',
    ...options,
  }
  const privateProp = '_' + lowerFirst(options.propName)
  const publicProp = '$' + lowerFirst(options.propName)
  const privateVmProp = privateProp + 'Vm'
  const publicVmProp = publicProp + 'Vm'
  const computedProp = 'current' + upperFirst(options.propName)
  const updateEvent = 'update;' + lowerFirst(options.propName)
  const serviceName = lowerFirst(options.serviceName) + 'Container'
  const getSourceTargetMethod = `get${upperFirst(options.serviceName)}Target`
  const getSourceMethod = `get${upperFirst(options.serviceName)}`
  const setSourceMethod = `set${upperFirst(options.serviceName)}`

  return {
    computed: {
      [computedProp] () {
        if (!(this.rev && this[publicProp])) return

        return getSourceId(this[publicProp])
      },
    },
    watch: {
      [computedProp]: debounce(function (value, prev) {
        if (value === prev) return

        this.$emit(updateEvent, value)
      }, FRAME_TIME),
    },
    created () {
      /**
       * @type {module:ol/source/Source~Source|null}
       * @private
       */
      this[privateProp] = null
      /**
       * @type {Object|null}
       * @private
       */
      this[privateVmProp] = null

      this::defineServices()
    },
    methods: {
      /**
       * @returns {{readonly sourceContainer: Object}}
       * @protected
       */
      getServices () {
        const vm = this

        return {
          get [serviceName] () { return vm },
        }
      },
      /**
       * @return {Promise<SourceTarget|undefined>}
       * @protected
       */
      [getSourceTargetMethod] () {
        throw new Error(`Not implemented method: ${getSourceTargetMethod}`)
      },
      /**
       * @return {module:ol/source/Source~Source|null}
       */
      [getSourceMethod] () {
        return this[privateProp]
      },
      /**
       * @param {SourceLike|undefined} source
       * @return {void}
       */
      async [setSourceMethod] (source) {
        if (isFunction(source?.resolveOlObject)) {
          source = await source.resolveOlObject()
        }
        source || (source = null)

        if (source === this[privateProp]) return

        const sourceTarget = await this[getSourceTargetMethod]()
        if (!sourceTarget) return

        this[privateProp] = source
        this[privateVmProp] = source?.vm && source.vm[0]
        await sourceTarget.setSource(source)
      },
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      [publicProp]: {
        enumerable: true,
        get: this[getSourceMethod],
      },
      [publicVmProp]: {
        enumerable: true,
        get: () => this[privateVmProp],
      },
    })
  }
}

/**
 * Source container mixin.
 */
export default createSourceContainer()
