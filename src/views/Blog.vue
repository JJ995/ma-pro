<template>
    <div class="blog">
        <router-view/>
        <router-link to="/">&laquo; Back</router-link>
    </div>
</template>

<script>
    export default {
        name: 'blog',
    }
</script>