/* global describe, it, expect */
import * as style from '@/ol-ext/style'

describe('ol style helper', () => {
  /** @test normalizeColor */
  describe('normalizeColor', () => {
    it('should convert string representation to RGBA array', () => {
      expect(style.normalizeColor('#ffa500')).to.be.deep.equal([ 255, 165, 0, 1 ])
      expect(style.normalizeColor('rgb(255, 165, 10)')).to.be.deep.equal([255, 165, 10, 1])
      expect(style.normalizeColor('rgba(255, 165, 10, 0.5)')).to.be.deep.equal([255, 165, 10, 0.5])
    })

    it('should leave array representation as is', () => {
      const color = [123, 200, 100]

      expect(style.normalizeColor(color)).to.be.deep.equal(color)
    })
  })

  describe('createTextStyle', () => {
    /** @var ts {ol/style/Text~Text} */
    let ts

    it('should create default style', () => {
      ts = style.createTextStyle({
        text: 'qwerty',
      })
      expect(ts.getText()).to.be.equal('qwerty')
      expect(ts.getFont()).to.be.equal('10px sans-serif')
    })

    it('should allow font styling', () => {
      ts = style.createTextStyle({
        text: 'qwerty',
        textFontWeight: 'bold',
        textFontSize: '1.5em',
        textFont: 'Arial, sans-serif',
      })
      expect(ts.getText()).to.be.equal('qwerty')
      expect(ts.getFont()).to.be.equal('bold 1.5em Arial, sans-serif')
    })
  })
})
