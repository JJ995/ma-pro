<template>
    <div class="home">
        <img alt="Vue logo" src="../assets/logo.png">
        <div class="sections">
            <div v-for="(section, index) in Object.keys(entries)" :key="index" class="group">
                <h2 class="center">{{section}}</h2>
                <div class="section" v-for="entry in entries[section]" :key="entry.id">
                    <div class="entry">
                        <router-link :to="{name: entry.id}">{{entry.title}}</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import entries from '../data/manifest'

    export default {
        name: 'home',
        computed: {
            entries() {
                return entries
            }
        }
    }
</script>
