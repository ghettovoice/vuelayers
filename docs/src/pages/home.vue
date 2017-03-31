<template>
  <div>Home page</div>
</template>

<script>
  import packageJson from '../../package.json'

  export default {
    name: 'home',
    meta: {
      title: 'Home',
      description: `${packageJson.description}`
    }
  }
</script>

<style></style>
