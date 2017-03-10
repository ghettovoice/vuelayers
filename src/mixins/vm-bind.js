export default {
  methods: {
    bindSelfTo (object) {
      this._vmBinded = object

      return Object.defineProperty(object, '$vm', {
        enumerable: true,
        configurable: true,
        get: () => this
      })
    }
  },
  destroyed () {
    delete this._vmBinded.$vm
  }
}
