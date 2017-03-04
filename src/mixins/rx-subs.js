export default {
  methods: {
    subscribeAll () { },
    /**
     * @protected
     */
    unsubscribeAll () {
      Object.keys(this.rxSubs).forEach(name => {
        this.rxSubs[ name ].unsubscribe()
        delete this.rxSubs[ name ]
      })
    }
  },
  beforeCreate () {
    /**
     * @type {Subscription}
     * @protected
     */
    this.rxSubs = {}
  },
  destroyed () {
    this.unsubscribeAll()
  }
}
