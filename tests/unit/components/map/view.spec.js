import { expect } from 'chai'
import Vue from 'vue'
import { View as olView } from 'ol'
import { Map, View } from '@/components/map'
import { VM_PROP } from '@/mixins'

describe('view component', () => {
  const MapCtor = Vue.extend(Map)
  const map = new MapCtor({
    propsData: {
      id: 'test',
    },
  })
  const Ctor = Vue.extend(View)

  describe('created hook', () => {
    it('should export $createPromise', done => {
      const vm = new Ctor({
        parent: map,
        propsData: {
          id: 'test',
        },
      })

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
      const vm = new Ctor({
        parent: map,
        propsData: {
          id: 'test',
        },
      }).$mount()

      expect(vm.$mountPromise).to.be.not.undefined
      expect(vm.$mountPromise.then).to.be.a('function')

      vm.$mountPromise.then(() => {
        vm.$destroy()
        Vue.nextTick(done)
      }).catch(done)
    })
  })
})
