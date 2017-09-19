<template lang="pug">
  div.navbar-item.has-dropdown(:class="classes")
    component.navbar-link(:is="tag", v-bind="props", @click="onClick")
      slot

    div.navbar-dropdown(:class="dropdownClasses")
      slot(name="dropdown")
</template>

<script>
  import Item from './item.vue'

  const props = {
    hover: Boolean,
    right: Boolean,
    box: Boolean,
  }

  const computed = {
    classes () {
      return {
        [this.$options.name]: true,
        ...this::Item.computed.classes(),
        'is-hoverable': this.hover,
      }
    },
    dropdownClasses () {
      return {
        'is-right': this.right,
        'is-boxed': this.box,
      }
    },
  }

  export default {
    name: 'vld-navbar-dropdown-item',
    extends: Item,
    props,
    computed,
  }
</script>
