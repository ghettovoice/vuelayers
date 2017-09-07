<template>
  <component :is="tag" v-bind="props" class="navbar-item" :class="classes" @click="onClick">
    <slot></slot>
  </component>
</template>

<script>
  const props = {
    link: String,
    active: Boolean,
    router: Boolean,
    title: String,
    target: String,
  }

  const computed = {
    tag () {
      if (!this.link) return 'div'

      return this.router ? 'router-link' : 'a'
    },
    classes () {
      return {
        'is-active': this.active,
      }
    },
    props () {
      const props = {
        title: this.title,
      }

      if (this.link) {
        if (this.router) {
          props.to = this.link
        } else {
          props.href = this.link
        }
      }

      if (this.target) {
        props.target = this.target
      }

      return props
    },
  }

  const methods = {
    onClick () {
      this.$emit('click')
    },
  }

  export default {
    name: 'vl-navbar-item',
    props,
    computed,
    methods,
  }
</script>

<style>
</style>
