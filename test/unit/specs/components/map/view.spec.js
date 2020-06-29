import { Map, View } from '@/components/map'
import { VM_PROP } from '@/mixin'
import { View as olView } from 'ol'
import Vue from 'vue'

describe('view component', () => {
  const MapCtor = Vue.extend({
    ...Map,
    propsData: {
      id: 'test',
    },
  })
  const map = new MapCtor()
  const Ctor = Vue.extend({
    ...View,
    parent: map,
    propsData: {
      id: 'test',
    },
  })

  describe('created hook', () => {
    it('should export $createPromise', done => {
      const vm = new Ctor()

      expect(vm.$createPromise).to.be.not.undefined
      expect(vm.$createPromise.then).to.be.a('function')

      vm.$createPromise.then(() => {
        expect(vm.$olObject).to.be.instanceof(olView)
        expect(vm.$view).to.equal(vm.$olObject)
        expect(vm.$view[VM_PROP].includes(vm)).to.be.true

        vm.$destroy()
        Vue.nextTick(done)
      }).catch(done)
    })
  })

  describe('mounted hook', () => {
    it('should export $mountPromise', done => {
      const vm = new Ctor().$mount()

      expect(vm.$mountPromise).to.be.not.undefined
      expect(vm.$mountPromise.then).to.be.a('function')

      vm.$mountPromise.then(() => {
        vm.$destroy()
        Vue.nextTick(done)
      }).catch(done)
    })
  })
})
