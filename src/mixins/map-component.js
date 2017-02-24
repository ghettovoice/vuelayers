import ol from 'openlayers'

export default {
  beforeCreate () {
    // Layer components can't be rendered outside of Map component
    if (
      !this.$parent || typeof this.$parent.getMap === 'undefined' ||
      !(this.$parent.getMap() instanceof ol.Map)
    ) {
      throw new Error("Map component must be used only inside component with 'map' property")
    }
    /**
     * @protected
     */
    this.map = this.$parent.getMap()
  }
}
