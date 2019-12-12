<template>
    <button v-on:click="count--">{{ text }} | You decremented me {{ count }} times.</button>
</template>

<script>
    export default {
        name: 'ButtonDecrementer',
        props: ['text'],
        data: function () {
            return {
                count: 0
            }
        }
    }
</script>
