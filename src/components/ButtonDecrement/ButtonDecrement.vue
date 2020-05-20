<template>
  <CustomButton :on-click="decrement">
    {{ text }} | You've decremented me {{ count }} times.
  </CustomButton>
</template>

<script src="./ButtonDecrement.mjs"></script>
