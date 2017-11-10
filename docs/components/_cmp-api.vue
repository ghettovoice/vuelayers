<template lang="pug">
  b-tabs(':class'="$options.name")
    b-tab-item(v-if="props.length" label="Props")
      b-table.doc-table(':data'="props" mobile-cards)
        template(slot-scope="scope")
          b-table-column(label="Name")
            code {{ scope.row.name }}
          b-table-column(label="Description" v-html="scope.row.description")
          b-table-column(label="Type")
            span.is-type {{ scope.row.typeExpression }}
          b-table-column(label="Required")
            b-icon.checkbox(
              ':type'="scope.row.required ? 'is-info' : 'is-light'"
              ':icon'="scope.row.required ? 'check-square-o' : 'square-o'"
            )
          b-table-column(label="Sync")
            b-icon.checkbox(
              ':type'="scope.row.vueSync ? 'is-info' : 'is-light'"
              ':icon'="scope.row.vueSync ? 'check-square-o' : 'square-o'")
          b-table-column(label="Default")
            code {{ scope.row.defaultvalue || 'undefined' }}
    b-tab-item(v-if="otherMembers.length" label="Other members")
      b-table.doc-table(':data'="otherMembers" mobile-cards)
        template(slot-scope="scope")
          b-table-column(label="Name")
            code {{ scope.row.name }}
          b-table-column(label="Description" v-html="scope.row.description")
          b-table-column(label="Type")
            span.is-type {{ scope.row.typeExpression }}
    b-tab-item(v-if="methods.length" label="Methods")
      b-table.doc-table(':data'="methods" mobile-cards)
        template(slot-scope="scope")
          b-table-column(label="Name")
            code {{ scope.row.name }}
          b-table-column(label="Description" v-html="scope.row.description")
          b-table-column(label="Arguments") TODO: render params list
          b-table-column(label="Returns")
            p(v-for="(ret, i) in scope.row.returns" ':key'="i")
              span.is-type {{ ret.typeExpression }}
              template(v-html="ret.description")
    b-tab-item(v-if="events.length" label="Events")
      b-table.doc-table(':data'="events" mobile-cards)
        template(slot-scope="scope")
          b-table-column(label="Name")
            code {{ scope.row.name }}
          b-table-column(label="Description" v-html="scope.row.description")
          b-table-column(label="Argument")
            span.is-type {{ scope.row.typeExpression }}
    b-tab-item(v-if="slots.length" label="Slots")
      b-table.doc-table(':data'="slots" mobile-cards)
        template(slot-scope="scope")
          b-table-column(label="Name")
            code {{ scope.row.name }}
          b-table-column(label="Description" v-html="scope.row.description")
</template>

<script>
  import { extractVueProtoParts } from '../jsdoc-helper'

  const props = {
    doclets: {
      type: Array,
      required: true,
    },
  }

  const computed = {
    proto () {
      return extractVueProtoParts(this.doclets) || {}
    },
    props () {
      return this.proto.props || []
    },
    compProps () {
      return this.proto.compProps || []
    },
    dataProps () {
      return this.proto.dataProps || []
    },
    otherMembers () {
      return this.proto.otherMembers || []
    },
    methods () {
      return this.proto.methods || []
    },
    events () {
      return this.proto.events || []
    },
    slots () {
      return this.proto.slots || []
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

<style>
</style>
