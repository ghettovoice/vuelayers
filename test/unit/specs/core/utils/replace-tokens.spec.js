/* global describe, it, expect */
import replaceTokens from '../../../../../src/core/utils/replace-tokens'

/** @test replaceTokens */
describe('replaceTokens', () => {
  it('should apply tokens replacement from hashmap', () => {
    const str = 'http://localhost/tiles/{z}/{x}/{y}.{format}?apiKey={apiKey}&mapId={mapId}'
    const replacement = {
      format: 'png',
      apiKey: 'my-super-secret-key',
      mapId: 'shik-map',
    }
    const expected = `http://localhost/tiles/{z}/{x}/{y}.${replacement.format}?apiKey=${replacement.apiKey}&mapId=${replacement.mapId}`

    expect(replaceTokens(str, replacement)).to.be.equal(expected)
  })
})
