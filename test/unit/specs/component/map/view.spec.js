/* global describe, it, expect */
import olView from 'ol/view'
import Vue from 'vue'
import Map from '@/component/map'

describe('view component', () => {
  const Ctor = Vue.extend(Map.View)

  describe('created hook', () => {
    it('should export $createPromise', done => {
      const vm = new Ctor()

      expect(vm.$createPromise).to.be.not.undefined
      expect(vm.$createPromise.then).to.be.a('function')

      vm.$createPromise.then(() => {
        expect(vm.$olObject).to.be.instanceof(olView)
        expect(vm.$view).to.equal(vm.$olObject)
        expect(vm.$view[vm.$options.VM_PROP].includes(vm)).to.be.true

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
