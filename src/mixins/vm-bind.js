export default {
  methods: {
    bindSelfTo (object) {
      this._vmBinded = object

      return Object.defineProperty(object, '$vm', {
        enumerable: true,
        get: () => this
      })
    }
  },
  destroyed () {
    if (this._vmBinded) {
      this._vmBinded.$vm = undefined
    }
  }
}
