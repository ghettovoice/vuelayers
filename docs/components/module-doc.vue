<template lang="pug">
  section(':class'="$options.name")
    template(v-html="moduleDoclet.description")


</template>

<script>
  import jsDocIndex from '../jsdoc-index.json'

  const props = {
    module: {
      type: String,
      required: true,
    },
  }

  const isPublicDoclet = doclet => !doclet.undocumented && (!d.access || d.access === 'public')

  const computed = {
    moduleDoclet () {
      return jsDocIndex.find(doclet => {
        return doclet.name === this.module &&
          doclet.kind === 'module' &&
          isPublicDoclet(doclet)
      })
    },

  }

  export default {
    name: 'vld-module-doc',
    props,
    computed,
  }
</script>

<style>
</style>
