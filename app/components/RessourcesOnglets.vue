<script setup lang="ts">
// Deux pages distinctes plutôt qu'un onglet piloté par un paramètre d'URL :
// chacune garde son titre, sa description et son entrée de sitemap.
const route = useRoute()
const onglets = [
  { label: '📚 Livres', to: '/ressources/livres' },
  { label: '🎬 Vidéos', to: '/ressources/videos' }
]
</script>

<template>
  <nav class="flex justify-center gap-2 mt-8" aria-label="Rubriques de ressources">
    <NuxtLink
      v-for="o in onglets"
      :key="o.to"
      :to="o.to"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors"
      :class="route.path.startsWith(o.to)
        ? 'bg-gray-900 border-gray-900 text-white'
        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'"
      :aria-current="route.path.startsWith(o.to) ? 'page' : undefined"
    >
      {{ o.label }}
    </NuxtLink>
  </nav>
</template>
