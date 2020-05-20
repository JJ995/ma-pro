<template>
  <div class="content home">
    <div class="sections">
      <div
        v-for="(section, index) in Object.keys(entries)"
        :key="index"
        class="group"
      >
        <h2>
          {{ section }}
        </h2>
        <div
          v-for="entry in entries[section]"
          :key="entry.id"
          class="section"
        >
          <p class="entry">
            <router-link :to="{name: entry.id}">
              {{ entry.title }} ({{ entry.date }}, {{ entry.author }})
            </router-link>
          </p>
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
