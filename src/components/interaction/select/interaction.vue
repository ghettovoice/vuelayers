<script>
  import Vue from 'vue'
  import SelectInteraction from 'ol/interaction/select'
  import Feature from 'ol/feature'
  import {
    mapValues,
    differenceWith,
    isPlainObject,
    isNumber,
    isString,
    isFunction,
    constant,
    stubArray,
    forEach
  } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/operator/share'
  import '../../../rx-ext'
  import interaction from '../interaction'
  import styleTarget from '../../style-target'
  import * as assert from '../../../utils/assert'

  // todo add other options, like event modifiers
  const props = {
    filter: {
      type: Function,
      default: () => constant(true)
    },
    hitTolerance: {
      type: Number,
      default: 0
    },
    multi: {
      type: Boolean,
      default: false
    },
    /**
     * Initial selection
     * @type {string[]|number[]} Initial selection as Array of ids
     */
    selected: {
      type: Array,
      default: stubArray
    },
    wrapX: {
      type: Boolean,
      default: true
    }
  }

  const computed = {
    currentSelected () {
      if (this.rev) {
        return this.$features.map(extractId)
      }

      return []
    }
  }

  const methods = {
    /**
     * @return {ol.interaction.Select}
     * @protected
     */
    createInteraction () {
      return new SelectInteraction({
        multi: this.multi,
        wrapX: this.wrapX,
        filter: this.filter,
        style: this.createStyleFunc()
      })
    },
    /**
     * @param {Object} olExt
     * @return {ol.StyleFunction}
     * @protected
     */
    getDefaultStyles (olExt) {
      const defaultStyles = mapValues(styles => styles.map(olExt.style.style), olExt.style.defaultEditStyle())

      return function __selectDefaultStyleFunc (feature) {
        if (feature.getGeometry()) {
          return defaultStyles[feature.getGeometry().getType()]
        }
      }
    },
    /**
     * @return {ol.Feature[]}
     */
    getFeatures () {
      return (this.$interaction && this.$interaction.getFeatures().getArray()) || []
    },
    /**
     * @return {ol.interaction.Interaction|undefined}
     * @protected
     */
    getStyleTarget () {
      return this.$interaction
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::interaction.methods.mount()
      this.selected.forEach(this.select)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unselectAll()
      this::interaction.methods.unmount()
    },
    /**
     * @param {GeoJSONFeature|Vue|ol.Feature|string|number} feature
     * @return {void}
     * @throws {Error}
     */
    select (feature) {
      assert.hasMap(this)
      assert.hasInteraction(this)

      let id = extractId(feature)
      if (!id) {
        throw new Error('Undefined feature id')
      }
      if (feature instanceof Vue) {
        feature = feature.$feature
      }

      const selectedIds = this.$features.map(extractId)
      if (selectedIds.includes(id)) return

      if (!(feature instanceof Feature)) {
        feature = undefined
        forEach(layer => {
          const source = layer.getSource()

          if (source && isFunction(source.getFeatureById)) {
            feature = source.getFeatureById(id)
          }

          return !feature
        }, this.$map.getLayers().getArray())
      }

      feature && this.$interaction.getFeatures().push(feature)
    },
    /**
     * @param {GeoJSONFeature|Vue|ol.Feature|string|number} feature
     * @return {void}
     */
    unselect (feature) {
      assert.hasInteraction(this)

      let id = extractId(feature)
      if (!id) {
        throw new Error('Undefined feature id')
      }
      if (feature instanceof Vue) {
        feature = feature.$feature
      }

      const selectedIds = this.$features.map(extractId)
      const idx = selectedIds.findIndex(x => x === id)

      if (idx !== -1) {
        this.$interaction.getFeatures().removeAt(idx)
      }
    },
    /**
     * @param {Array<{style: ol.style.Style, condition: (function|boolean|undefined)}>|ol.StyleFunction|Vue|undefined} styles
     * @return {void}
     * @protected
     */
    setStyle (styles) {
      if (styles !== this._styles) {
        this._styles = styles
        this.requestRefresh()
      }
    },
    /**
     * @return {Promise}
     */
    refresh () {
      return Promise.all([
        new Promise(resolve => {
          assert.hasInteraction(this)

          const featuresCollection = this.$interaction.getFeatures()
          featuresCollection.once('change', () => resolve())
          featuresCollection.changed()
        }),
        this::interaction.methods.refresh()
      ])
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToInteractionChanges()
    },
    /**
     * Removes all features from selection.
     * @return {void}
     */
    unselectAll () {
      assert.hasInteraction(this)

      this.$interaction.getFeatures().clear()
    }
  }

  const diffById = differenceWith((a, b) => extractId(a) === extractId(b))
  const watch = {
    selected (value) {
      if (!this.$interaction) return

      let forSelect = diffById(value, this.$features)
      let forUnselect = diffById(this.$features, value)

      forSelect.forEach(this.select)
      forUnselect.forEach(this.unselect)
    }
  }

  export default {
    name: 'vl-interaction-select',
    mixins: [interaction, styleTarget],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          class: this.$options.name
        }
      }
    },
    data () {
      return {
        rev: 1
      }
    },
    created () {
      Object.defineProperties(this, {
        $features: {
          enumerable: true,
          get: this.getFeatures
        }
      })
    }
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToInteractionChanges () {
    assert.hasInteraction(this)

    let events
    let eventsIdent = this.getFullIdent('events')

    if (this.$identityMap.has(eventsIdent)) {
      events = this.$identityMap.get(eventsIdent)
    } else {
      events = Observable.fromOlEvent(this.$interaction, 'select').share()

      if (eventsIdent) {
        this.$identityMap.set(eventsIdent, events)
      }
    }

    this.subscribeTo(
      events,
      ({ selected, deselected, mapBrowserEvent }) => {
        ++this.rev

        deselected.forEach(feature => this.$emit('unselect', { feature, mapBrowserEvent }))
        selected.forEach(feature => this.$emit('select', { feature, mapBrowserEvent }))

        this.$emit('update:selected', this.$features.map(extractId))
      }
    )
  }

  /**
   * @param {GeoJSONFeature|Vue|ol.Feature|string|number} feature
   * @return {string|number}
   * @throws {Error}
   */
  function extractId (feature) {
    let id
    if (isPlainObject(feature) || feature instanceof Vue) {
      id = feature.id
    } else if (feature instanceof Feature) {
      id = feature.getId()
    } else if (isString(feature) || isNumber(feature)) {
      id = feature
    } else {
      throw new Error('Illegal feature format')
    }

    return id
  }
</script>
