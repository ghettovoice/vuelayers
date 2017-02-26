export default {
  beforeCreate () {
    /**
     * @type {Subscription}
     * @protected
     */
    this.subs = {}
  },
  beforeDestroy () {
    Object.keys(this.subs).forEach(name => {
      this.subs[ name ].unsubscribe()
      delete this.subs[ name ]
    })
  }
}
