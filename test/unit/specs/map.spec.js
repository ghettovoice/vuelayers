import ol from 'openlayers'
import Vue from 'vue'
import Map from 'vl-components/map'

describe('map component', () => {
  describe('map/map.vue', () => {
    const Ctor = Vue.extend(Map)
    // todo add tests
    it('should render correct contents', done => {
      const vm = new Ctor().$mount()

      Vue.nextTick(() => {
        expect(vm.$el).to.have.class('vl-map')
        expect(vm.$el).to.contain('.ol-viewport canvas')

        vm.$destroy()
        Vue.nextTick(done)
      })
    })

    it('should correctly initialize OpenLayers map', done => {
      const vm = new Ctor().$mount()

      Vue.nextTick(() => {
        expect(vm.map).to.be.instanceOf(ol.Map)
        expect(vm.map.getTargetElement()).to.be.equal(vm.$refs.map)
        expect(vm.map.getLayers().getLength()).to.be.equal(0)

        vm.$destroy()
        Vue.nextTick(done)
      })
    })
  })
})
