<template lang="pug">
  section.content(':class'="$options.name")
    b-tabs
      b-tab-item(v-if="props.length" label="Props")
        b-table.doc-table(':data'="props" mobile-cards)
          template(slot-scope="scope")
            b-table-column(label="Name")
              code {{ scope.row.name }}
            b-table-column(label="Description" v-html="scope.row.description")
            b-table-column(label="Type")
              span.is-type {{ scope.row.type }}
            b-table-column(label="Required")
              b-icon.checkbox(
                ':type'="scope.row.required ? 'is-info' : 'is-light'"
                ':icon'="scope.row.required ? 'check-square-o' : 'square-o'"
              )
            b-table-column(label="Sync")
              b-icon.checkbox(
                ':type'="scope.row.sync ? 'is-info' : 'is-light'"
                ':icon'="scope.row.sync ? 'check-square-o' : 'square-o'")
            b-table-column(label="Default")
              code {{ scope.row.default }}
      b-tab-item(v-if="members.length" label="Other members")
        b-table.doc-table(':data'="members" mobile-cards)
          template(slot-scope="scope")
            b-table-column(label="Name")
              code {{ scope.row.name }}
            b-table-column(label="Description" v-html="scope.row.description")
            b-table-column(label="Type")
              span.is-type {{ scope.row.type }}
      b-tab-item(v-if="methods.length" label="Methods")
        b-table.doc-table(':data'="methods" mobile-cards)
          template(slot-scope="scope")
            b-table-column(label="Name")
              code {{ scope.row.name }}
            b-table-column(label="Description" v-html="scope.row.description")
            b-table-column(label="Arguments")
              b-table.doc-table(v-if="scope.row.arguments && scope.row.arguments.length" ':data'="scope.row.arguments")
                template(slot-scope="scope")
                  b-table-column(label="Name")
                    code {{ scope.row.name }}
                  b-table-column(label="Description" v-html="scope.row.description")
                  b-table-column(label="Type")
                    span.is-type {{ scope.row.type }}
            b-table-column(label="Returns")
              p(v-for="(ret, i) in scope.row.returns" ':key'="i")
                span.is-type {{ ret.type }}
                template(v-html="ret.description")
      b-tab-item(v-if="events.length" label="Events")
        b-table.doc-table(':data'="events" mobile-cards)
          template(slot-scope="scope")
            b-table-column(label="Name")
              code {{ scope.row.name }}
            b-table-column(label="Description" v-html="scope.row.description")
            b-table-column(label="Argument")
              span.is-type {{ scope.row.argument }}
      b-tab-item(v-if="slots.length" label="Slots")
        b-table.doc-table(':data'="slots" mobile-cards)
          template(slot-scope="scope")
            b-table-column(label="Name")
              code {{ scope.row.name }}
            b-table-column(label="Description" v-html="scope.row.description")
            b-table-column(label="Scoped")
              b-icon.checkbox(
              ':type'="scope.row.scoped ? 'is-info' : 'is-light'"
              ':icon'="scope.row.scoped ? 'check-square-o' : 'square-o'")
</template>

<script>
  const props = {
    api: {
      type: Object,
      required: true,
    },
  }

  const computed = {
    props () {
      return this.api.props || []
    },
    members () {
      return this.api.members || []
    },
    methods () {
      return this.api.methods || []
    },
    events () {
      return this.api.events || []
    },
    slots () {
      return this.api.slots || []
    },
  }

  const methods = {}

  export default {
    name: 'vld-cmp-api',
    props,
    computed,
    methods,
  }
</script>

<style lang="sass">
  .vld-cmp-api
    &:not(:last-child)
      margin-bottom: 1rem
</style>
