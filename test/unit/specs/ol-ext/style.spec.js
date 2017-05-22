/* global describe, it, expect */
import * as styleHelper from '../../../../src/ol-ext/style'

describe('ol style helper', () => {
  /** @test normalizeColor */
  describe('normalizeColor', () => {
    it('should convert string representation to RGBA array', () => {
      expect(styleHelper.normalizeColor('#ffa500')).to.be.deep.equal([ 255, 165, 0, 1 ])
      expect(styleHelper.normalizeColor('rgb(255, 165, 10)')).to.be.deep.equal([ 255, 165, 10, 1 ])
      expect(styleHelper.normalizeColor('rgba(255, 165, 10, 0.5)')).to.be.deep.equal([ 255, 165, 10, 0.5 ])
    })

    it('should leave array representation as is', () => {
      const color = [ 123, 200, 100 ]

      expect(styleHelper.normalizeColor(color)).to.be.deep.equal(color)
    })
  })
})
