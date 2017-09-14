/* global expect, describe, it */
import coalesce from '../../../../../src/core/utils/coalesce'

/** @test coalesce */
describe('coalesce', () => {
  it('should return first non-null value', () => {
    expect(coalesce(undefined, null, 0)).to.be.equal(0)
    expect(coalesce('qwe', null)).to.be.equal('qwe')
    expect(coalesce()).to.be.undefined
  })
})
