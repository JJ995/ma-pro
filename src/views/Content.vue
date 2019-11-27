<template>
    <div class="content">
        <router-view/>
        <router-link to="/">&laquo; Back</router-link>
    </div>
</template>

<script>
    export default {
        name: 'content'
    }
</script>
