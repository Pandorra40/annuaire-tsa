<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number, message?: string, statusMessage?: string } }>()

const is404 = computed(() => props.error.statusCode === 404)

usePageSeo({
  title: is404.value ? 'Page introuvable — Annuaire TSA' : 'Erreur — Annuaire TSA',
  description: is404.value
    ? 'La page demandée n\'existe pas ou a été déplacée sur l\'Annuaire TSA.'
    : 'Une erreur est survenue sur l\'Annuaire TSA.',
  noindex: true
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-black text-gray-900 text-lg tracking-tight" @click="clearError()">
          <img src="/logo-tsa.svg" alt="" class="h-7 w-auto" />
          Annuaire TSA
        </NuxtLink>
        <nav class="hidden sm:flex items-center gap-5 text-sm font-medium text-gray-500" aria-label="Navigation">
          <NuxtLink to="/" class="hover:text-gray-900" @click="clearError()">Annuaire</NuxtLink>
          <NuxtLink to="/associations" class="hover:text-gray-900" @click="clearError()">Associations</NuxtLink>
          <NuxtLink to="/cra" class="hover:text-gray-900" @click="clearError()">CRA</NuxtLink>
          <NuxtLink to="/ressources/livres" class="hover:text-gray-900" @click="clearError()">Ressources</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)" />
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />

      <div class="relative max-w-2xl mx-auto px-6 py-20 text-center">
        <p class="text-7xl sm:text-8xl font-black text-gray-200 leading-none mb-6 tabular-nums" aria-hidden="true">
          {{ error.statusCode }}
        </p>
        <h1 class="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
          {{ is404 ? 'Page introuvable' : 'Une erreur est survenue' }}
        </h1>
        <p class="text-gray-600 text-lg leading-relaxed mb-10 max-w-md mx-auto">
          {{ is404
            ? 'Cette adresse n’existe pas ou a été déplacée. Revenez à l’annuaire ou explorez les ressources.'
            : 'Une erreur inattendue s’est produite. Réessayez dans quelques instants.'
          }}
        </p>
        <div class="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            class="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            @click="handleError"
          >
            ← Retour à l'annuaire
          </button>
          <NuxtLink
            to="/cra"
            class="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 bg-white text-gray-800 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            @click="clearError()"
          >
            Centres CRA
          </NuxtLink>
          <NuxtLink
            to="/associations"
            class="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 bg-white text-gray-800 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            @click="clearError()"
          >
            Associations
          </NuxtLink>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t border-gray-100 py-8">
      <div class="max-w-6xl mx-auto px-6 text-sm text-gray-500 flex flex-wrap gap-4 justify-between">
        <p class="font-black text-gray-900">Annuaire TSA</p>
        <div class="flex flex-wrap gap-4">
          <NuxtLink to="/apropos" class="hover:text-gray-900" @click="clearError()">À propos</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-gray-900" @click="clearError()">Contact</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>
