/**
 * Base Vue component mixin for all entities from OpenLayer world.
 */
export default {
  methods: {
    update () {}
  },
  /**
   * Renders empty Node by default.
   *
   * @param {function} h
   */
  render: h => h()
}
