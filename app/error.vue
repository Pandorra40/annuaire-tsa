<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number, message: string } }>()

const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: is404.value ? 'Page introuvable — Annuaire TSA' : 'Erreur — Annuaire TSA'
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-3 font-bold text-lg text-gray-900 dark:text-white">
          <img src="/logo-tsa.svg" alt="Annuaire TSA" class="h-7 w-auto" />
          Annuaire TSA
        </NuxtLink>
      </template>
    </UHeader>

    <UMain>
      <UContainer class="py-20 text-center">
        <p class="text-8xl font-black text-gray-200 dark:text-gray-700 leading-none mb-6">
          {{ error.statusCode }}
        </p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {{ is404 ? 'Page introuvable' : 'Une erreur est survenue' }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
          {{ is404
            ? 'La page que vous cherchez n\'existe pas ou a été déplacée.'
            : 'Une erreur inattendue s\'est produite. Réessayez dans quelques instants.'
          }}
        </p>
        <div class="flex items-center justify-center gap-3 flex-wrap">
          <UButton color="neutral" variant="solid" size="lg" @click="handleError">
            ← Retour à l'annuaire
          </UButton>
          <UButton to="/livres" color="neutral" variant="outline" size="lg">
            📚 Livres TSA
          </UButton>
        </div>
      </UContainer>
    </UMain>
  </UApp>
</template>
