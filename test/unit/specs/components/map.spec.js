import olMap from 'ol/map'
import Vue from 'vue'
import { VM_PROP } from '../../../../src/consts'
import Map from '../../../../src/components/map'

describe('map component', () => {
  const Ctor = Vue.extend(Map)

  it('should correctly initialize', done => {
    const vm = new Ctor().$mount()

    Vue.nextTick(() => {
      expect(vm.map).to.be.instanceof(olMap)
      expect(vm.map[VM_PROP]).to.be.equal(vm)
      expect(vm.map.getTargetElement()).to.be.equal(vm.$refs.map)

      vm.$destroy()
      Vue.nextTick(done)
    })
  })

  it('should render correct contents', done => {
    const vm = new Ctor().$mount()

    Vue.nextTick(() => {
      expect(vm.$el).to.have.class('vl-map')
      expect(vm.$el).to.contain('.ol-viewport canvas')

      vm.$destroy()
      Vue.nextTick(done)
    })
  })

  it('should focus on map container', done => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const vm = new Ctor().$mount(div)

    Vue.nextTick(() => {
      vm.focus()
      expect(vm.$refs.map).to.be.equal(document.activeElement)

      vm.$destroy()
      Vue.nextTick(done)
    })
  })
})
