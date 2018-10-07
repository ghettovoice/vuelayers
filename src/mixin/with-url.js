import { pick, replaceTokens } from '../util/minilo'

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
      return replaceTokens(this.url, pick(this, this.urlTokens))
    },
    /**
     * @type {string[]}
     */
    urlTokens () { return [] },
  },
}
