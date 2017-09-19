/* global expect, describe, it, beforeEach, afterEach */
import IdentityMap from '../../../../../src/core/utils/identity-map'

describe('IdentityMap', () => {
  /**
   * @test IdentityMap
   */
  describe('constructor', () => {
    it('should init with empty map', () => {
      const identMap = new IdentityMap()

      expect(identMap.ids()).to.have.lengthOf(0)
    })
  })
  /**
   * @test IdentityMap#set
   */
  describe('#set()', () => {
    let identMap
    beforeEach(() => {
      identMap = new IdentityMap()
    })
    afterEach(() => {
      identMap = undefined
    })

    it('should add value to map with refs = 1', () => {
      identMap.set('ident', [1, 2, 3])

      expect(identMap.has('ident')).to.be.true
      expect(identMap.refs('ident')).to.equal(1)
    })

    it('should not add null values', () => {
      identMap.set('ident1', null)
      identMap.set('ident2', undefined)

      expect(identMap.ids()).to.have.lengthOf(0)
    })
  })
  /**
   * @test IdentityMap#get
   */
  describe('#get()', () => {
    let identMap
    let val = [1, 2, 3]
    beforeEach(() => {
      identMap = new IdentityMap()
      identMap.set('ident', val)
    })
    afterEach(() => {
      identMap = undefined
    })

    it('should return value from map and increase refs count', () => {
      expect(identMap.refs('ident')).to.equal(1)

      let val_ = identMap.get('ident')
      expect(val_).to.deep.equal(val)
      expect(identMap.refs('ident')).to.equal(2)
    })

    it('should return undefined for not existed idents', () => {
      expect(identMap.get('notExisted')).to.be.undefined
    })
  })
  /**
   * @test IdentityMap#get
   */
  describe('#unset()', () => {
    let identMap
    let val = [1, 2, 3]
    beforeEach(() => {
      identMap = new IdentityMap()
      identMap.set('ident', val)
    })
    afterEach(() => {
      identMap = undefined
    })

    it('should decrease refs count or unset value by ident', () => {
      expect(identMap.has('ident')).to.be.true
      identMap.get('ident')
      expect(identMap.refs('ident')).to.equal(2)

      identMap.unset('ident')
      expect(identMap.has('ident')).to.be.true
      expect(identMap.refs('ident')).to.equal(1)

      identMap.unset('ident')
      expect(identMap.has('ident')).to.be.false
    })
  })
  /**
   * @test IdentityMap#has
   */
  describe('#has()', () => {
    let identMap
    beforeEach(() => {
      identMap = new IdentityMap()
      identMap.set('ident1', 1)
      identMap.set('ident2', 2)
    })
    afterEach(() => {
      identMap = undefined
    })

    it('should check ident existence', () => {
      expect(identMap.has('ident1')).to.be.true
      expect(identMap.has('ident2')).to.be.true
      expect(identMap.has('notExisted')).to.be.false
    })
  })
  /**
   * @test IdentityMap#ids
   */
  describe('#ids()', () => {
    let identMap
    beforeEach(() => {
      identMap = new IdentityMap()
    })
    afterEach(() => {
      identMap = undefined
    })

    it('should return array of idents', () => {
      expect(identMap.ids()).to.be.an('array')
      expect(identMap.ids()).to.have.lengthOf(0)

      identMap.set('ident1', 1)
      identMap.set('ident2', 2)

      expect(identMap.ids()).to.be.an('array')
      expect(identMap.ids()).to.have.lengthOf(2)
    })
  })
  /**
   * @test IdentityMap#refs
   */
  describe('#refs()', () => {
    let identMap
    beforeEach(() => {
      identMap = new IdentityMap()
    })
    afterEach(() => {
      identMap = undefined
    })

    it('should return refs counter for ident', () => {
      identMap.set('ident', 1)

      expect(identMap.refs('ident')).to.equal(1)

      identMap.get('ident')
      identMap.get('ident')
      identMap.get('ident')

      expect(identMap.refs('ident')).to.equal(4)

      identMap.unset('ident')
      identMap.unset('ident')

      expect(identMap.refs('ident')).to.equal(2)
    })
  })
})
