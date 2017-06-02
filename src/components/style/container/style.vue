<script>
  import box from '../box'
  import { warndbg } from '../../../utils/debug'

  /**
   * @deprecated
   */
  export default {
    name: 'vl-style-container',
    extends: box,
    beforeCreate () {
      warndbg('vl-style-container was renamed to vl-style-box. ' +
        'Name "vl-style-container" now is deprecated and will be removed in the next release.')
    }
  }
</script>
