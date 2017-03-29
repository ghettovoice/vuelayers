// import OlView from 'ol/view'
import Vue from 'vue'
// import Map from 'vl-components/map'
import View from 'vl-components/view'

describe('view component', () => {
  // const MapCtor = Vue.extend(Map)
  const ViewCtor = Vue.extend(View)

  it('should throw error when used outside of map', () => {
    const vm = new ViewCtor()

    expect(() => vm.mountView()).to.throw(Error, /invalid usage of view component/i)
  })

  // it('should correctly initialize', done => {
  //
  // })
})
