/* global describe, it, expect */
import * as proj from '@/ol-ext/proj'

describe('ol coordinate helper', () => {
  const point3857 = [5565974.539663679, 7361866.113051185]
  const point4326 = [50, 55]
  const line3857 = [[5565974.539663679, 7361866.113051185], [-3896182.1777645755, -11068715.659379495]]
  const line4326 = [[50, 55], [-35, -70]]

  /** @test pointToLonLat */
  describe('pointToLonLat', () => {
    it('should transform point coordinate to EPSG:4326', () => {
      expect(proj.pointToLonLat(point3857, 'EPSG:3857')).to.be.deep.equal(point4326)
    })
  })

  /** @test pointFromLonLat */
  describe('pointFromLonLat', () => {
    it('should transform point coordinate from EPSG:4326', () => {
      expect(proj.pointFromLonLat(point4326, 'EPSG:3857')).to.be.deep.equal(point3857)
    })
  })

  /** @test lineToLonLat */
  describe('lineToLonLat', () => {
    it('should transform line coordinate to EPSG:4326', () => {
      expect(proj.lineToLonLat(line3857, 'EPSG:3857')).to.be.deep.equal(line4326)
    })
  })

  /** @test lineFromLonLat */
  describe('lineFromLonLat', () => {
    it('should transform line coordinate from EPSG:4326', () => {
      expect(proj.lineFromLonLat(line4326, 'EPSG:3857')).to.be.deep.equal(line3857)
    })
  })
})
