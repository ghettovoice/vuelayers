/* global describe, it, expect */
import isNumeric from '../../../../../src/core/utils/is-numeric'

/** @test isNumeric */
describe('isNumeric', () => {
  it('should return true for number like values', () => {
    expect(isNumeric(123)).to.be.true
    expect(isNumeric(123.321)).to.be.true
    expect(isNumeric('123')).to.be.true
    expect(isNumeric('123.321')).to.be.true
  })

  it('should return false for non numeric values', () => {
    expect(isNumeric('a123')).to.be.false
    expect(isNumeric('123.321-abc')).to.be.false
  })
})
