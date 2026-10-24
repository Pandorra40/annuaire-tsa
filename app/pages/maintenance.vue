<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Maintenance — Annuaire TSA',
  robots: 'noindex, nofollow'
})

const { data, error } = await useFetch<{ actif: boolean, message: string }>('/api/maintenance', {
  key: 'maintenance-state'
})

if (import.meta.server) {
  const event = useRequestEvent()
  if (data.value?.actif && event) {
    // SEO : indisponibilité temporaire (pas une redirection 302 seule)
    setResponseStatus(event, 503)
    setResponseHeader(event, 'Retry-After', 3600)
  } else if (data.value && !data.value.actif) {
    await navigateTo('/', { redirectCode: 302 })
  }
}

const message = computed(() =>
  data.value?.message
  || 'Le site est temporairement en maintenance pour une mise à jour. Merci de revenir dans quelques minutes.'
)

onMounted(() => {
  if (data.value && !data.value.actif) {
    navigateTo('/')
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <div class="h-1.5 w-full bg-amber-400" aria-hidden="true" />
    <main class="flex-1 flex items-center justify-center px-6 py-16">
      <div class="max-w-lg w-full text-center">
        <img src="/logo-tsa.svg" alt="Annuaire TSA" class="h-12 w-auto mx-auto mb-8" />
        <p class="text-sm font-semibold uppercase tracking-wide text-amber-700 mb-3">
          Maintenance
        </p>
        <h1 class="text-3xl sm:text-4xl font-black tracking-tight mb-4">
          Site temporairement indisponible
        </h1>
        <p v-if="error" class="text-slate-600 leading-relaxed mb-8">
          Une mise à jour est en cours. Merci de réessayer dans quelques minutes.
        </p>
        <p v-else class="text-slate-600 leading-relaxed mb-8 whitespace-pre-line">
          {{ message }}
        </p>
        <p class="text-sm text-slate-500">
          Les familles et praticiens pourront à nouveau consulter l’annuaire dès la fin de l’intervention.
        </p>
      </div>
    </main>
  </div>
</template>
