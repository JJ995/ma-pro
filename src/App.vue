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
      name: 'App',
      mounted: function () {
        this.$nextTick(function () {
          // Fire event when markdown content is rendered
          let int = setInterval(() => {
            if (document.querySelector('.markdown-body')) {
              console.log('Content rendered');
              window.document.dispatchEvent(new Event('content-rendered'));
              clearInterval(int);
            }
          }, 100);
          // Fire event anyway after 5 seconds in case no markdown content is on page
          window.setTimeout(() => {
            console.log('Content rendered (no markdown)');
            window.document.dispatchEvent(new Event('content-rendered'));
            clearInterval(int);
          }, 5000);
        });
      }
    }
</script>
