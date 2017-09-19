<template lang="pug">
  iframe.github-button(:class="[$options.name]", :src="src", frameborder="0", scrolling="0")
</template>

<script>
  const props = {
    user: {
      type: String,
      required: true,
    },
    repo: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: String,
    count: Boolean,
  }

  const BASE_URL = 'https://ghbtns.com/github-btn.html'

  const computed = {
    src () {
      let count = this.count ? '&count=true' : ''
      let size = this.size ? '&size=' + this.size : ''

      return `${BASE_URL}?user=${this.user}&repo=${this.repo}&type=${this.type}${count}${size}`
    },
  }

  export default {
    name: 'vld-github-btn',
    props,
    computed,
  }
</script>
