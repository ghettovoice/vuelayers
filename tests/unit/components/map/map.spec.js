import { expect, use } from 'chai'
import chaiDom from 'chai-dom'
import Vue from 'vue'
import { Map as olMap, View as olView } from 'ol'
import { Map } from '@/components/map'
import { VM_PROP } from '@/mixins'

use(chaiDom)

describe('vl-map', () => {
  const Ctor = Vue.extend(Map)

  describe('created hook', () => {
    it('should export $createPromise', done => {
      const vm = new Ctor({
        propsData: {
          id: 'test',
        },
      })

      expect(vm.$createPromise).to.be.not.undefined
      expect(vm.$createPromise.then).to.be.a('function')

      vm.$createPromise.then(() => {
        expect(vm.$olObject).to.be.instanceof(olMap)
        expect(vm.$map).to.equal(vm.$olObject)
        expect(vm.$map[VM_PROP].includes(vm)).to.be.true

        vm.$destroy()
        Vue.nextTick(done)
      }).catch(done)
    })
  })

  describe('mounted hook', () => {
    it('should export $mountPromise', done => {
      const vm = new Ctor({
        propsData: {
          id: 'test',
        },
      }).$mount()

      expect(vm.$mountPromise).to.be.not.undefined
      expect(vm.$mountPromise.then).to.be.a('function')

      vm.$mountPromise.then(() => {
        expect(vm.$map.getTargetElement()).to.be.equal(vm.$el)

        vm.$destroy()
        Vue.nextTick(done)
      }).catch(done)
    })

    it('should render correct contents', done => {
      const vm = new Ctor({
        propsData: {
          id: 'test',
        },
      }).$mount()

      vm.$mountPromise.then(() => {
        expect(vm.$el).to.have.class('vl-map')
        expect(vm.$el).to.contain('.ol-viewport')

        vm.$destroy()
        Vue.nextTick(done)
      }).catch(done)
    })
  })

  describe('#focus', () => {
    it('should focus on map container', done => {
      const div = document.createElement('div')
      document.body.appendChild(div)

      const vm = new Ctor({
        propsData: {
          id: 'test',
          tabindex: 0,
        },
      }).$mount(div)

      vm.$mountPromise.then(() => {
        vm.focus()
        expect(vm.$el).to.be.equal(document.activeElement)

        vm.$destroy()
        div.remove()
        Vue.nextTick(done)
      }).catch(done)
    })
  })

  describe('#$view / #getView()', () => {
    it('should return ol.View instance', done => {
      const vm = new Ctor({
        propsData: {
          id: 'test',
        },
      })

      vm.$createPromise.then(() => {
        expect(vm.$view).to.be.instanceof(olView)
        expect(vm.$view).to.equal(vm.$map.getView())

        vm.$destroy()
        Vue.nextTick(done)
      }).catch(done)
    })
  })
})
