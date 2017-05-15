<script>
  import { constant } from 'lodash/fp'
  import common from './common.vue'

  const props = {}

  const computed = {
    currentTitle: constant('404 Not Found'),
    currentSubtitle: constant("The requested page doesn't exists or has been moved to another URL"),
    additionalContainerCls: constant('not-found'),
    currentMainHeroCls: constant('is-info')
  }

  export default {
    name: 'page-not-found',
    mixins: [ common ],
    props,
    computed
  }
</script>
