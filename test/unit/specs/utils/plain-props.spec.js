/* global describe, it, expect */
import plainProps from '../../../../src/utils/plain-props'

/** @test plainProps */
describe('plainProps', () => {
  function Ctor () {}

  it('should clean the object from non-plain values', () => {
    const obj = {
      num: 123,
      str: 'qwe',
      arr: [ 1, 2, 3 ],
      func () {},
      inst: new Ctor(),
    }
    const expected = {
      num: 123,
      str: 'qwe',
      arr: [ 1, 2, 3 ],
    }

    expect(plainProps(obj)).to.be.deep.equal(expected)
  })
})
