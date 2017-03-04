import Vue from 'vue'
import Map from 'vl-components/map'

describe('map/map.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Map)
    const vm = new Constructor().$mount()
    expect(vm.$el).to.have.class('vl-map')
    expect(vm.$el).to.contain('canvas')
  })
})
