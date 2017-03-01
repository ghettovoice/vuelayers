export default {
  beforeCreate () {
    /**
     * @type {Subscription}
     * @protected
     */
    this.rxSubs = {}
  },
  beforeDestroy () {
    Object.keys(this.rxSubs).forEach(name => {
      this.rxSubs[ name ].unsubscribe()
      delete this.rxSubs[ name ]
    })
  }
}
