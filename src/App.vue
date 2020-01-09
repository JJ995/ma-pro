<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">
        Home
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<style src="./styles/base.less" lang="less"></style>

<script>
    export default {
        name: 'App'
    }
</script>
