<template>
  <div class="home">
    <div class="sections">
      <div
        v-for="(section, index) in Object.keys(entries)"
        :key="index"
        class="group"
      >
        <h2 class="center">
          {{ section }}
        </h2>
        <div
          v-for="entry in entries[section]"
          :key="entry.id"
          class="section"
        >
          <div class="entry">
            <router-link :to="{name: entry.id}">
              {{ entry.title }} ({{ entry.date }}, {{ entry.description }})
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import entries from '../data/sites'

    export default {
        name: 'Home',
        computed: {
            entries() {
                return entries
            }
        }
    }
</script>
