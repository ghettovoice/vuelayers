import { pick } from 'lodash/fp'
import { replaceTokens } from '../util/minilo'

export default {
  props: {
    url: {
      type: String,
    },
  },
  computed: {
    /**
     * @type {string}
     */
    urlTmpl () {
      return replaceTokens(this.url, pick(this.urlTokens, this))
    },
    /**
     * @type {string[]}
     */
    urlTokens () { return [] },
  },
}
