import { expect } from 'chai'
import { CanceledError } from '@/mixins'

describe('ol-cmp mixin', () => {
  describe('CanceledError', () => {
    it('should have correct name', () => {
      const err = new CanceledError('test')
      expect(err.name).to.be.equal('CanceledError')
    })

    it('should be instance of Error', () => {
      const err = new CanceledError('test')
      expect(err).be.instanceof(Error)
    })
  })
})
