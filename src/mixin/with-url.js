import { pick } from 'lodash/fp'
import replaceTokens from '../util/replace-tokens'

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
