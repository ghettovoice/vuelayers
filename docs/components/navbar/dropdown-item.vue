<template>
  <div class="navbar-item has-dropdown" :class="classes" >
    <component :is="tag" v-bind="props" class="navbar-link" @click="onClick">
      <slot></slot>
    </component>

    <div class="navbar-dropdown" :class="dropdownClasses">
      <slot name="dropdown"></slot>
    </div>
  </div>
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
    name: 'vl-navbar-dropdown-item',
    extends: [Item],
    props,
    computed,
  }
</script>

<style>
</style>
