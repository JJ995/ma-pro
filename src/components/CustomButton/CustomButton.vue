<template>
  <button
    class="custom-button"
    @click="onClick"
  >
    <slot>Button</slot>
  </button>
</template>

<script src="./CustomButton.mjs"></script>
<style src="./CustomButton.less" lang="less"></style>
