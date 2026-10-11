<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({
  title: 'Statistiques — Annuaire TSA',
  robots: 'noindex, nofollow'
})

type Periode = '7j' | '30j' | '3m' | '6m'

interface StatsPayload {
  periode: Periode
  jours: number
  depuis: string
  visites: {
    aujourdhui: number
    periode: number
    serie: { jour: string, hits: number }[]
    top_pages: { path: string, hits: number }[]
  }
  metier: Record<string, number>
}

const periodes: { id: Periode, label: string }[] = [
  { id: '7j', label: '7 jours' },
  { id: '30j', label: '30 jours' },
  { id: '3m', label: '3 mois' },
  { id: '6m', label: '6 mois' }
]

const periode = ref<Periode>('7j')
const loading = ref(true)
const error = ref('')
const data = ref<StatsPayload | null>(null)

const config = useRuntimeConfig()
const apiBase = computed(() => String(config.public.apiBase || '/api').replace(/\/$/, ''))

async function charger() {
  loading.value = true
  error.value = ''
  try {
    data.value = await $fetch<StatsPayload>(`${apiBase.value}/stats.php`, {
      query: { periode: periode.value }
    })
  } catch (e) {
    error.value = 'Impossible de charger les statistiques : ' + ((e as Error).message ?? 'erreur')
    data.value = null
  } finally {
    loading.value = false
  }
}

watch(periode, () => { void charger() })
onMounted(() => { void charger() })

// Rafraîchissement léger (pas temps réel)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => { void charger() }, 60_000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const maxSerie = computed(() => {
  const s = data.value?.visites.serie ?? []
  return Math.max(1, ...s.map(p => p.hits))
})

const labelsMetier: { key: string, label: string }[] = [
  { key: 'praticiens_publies', label: 'Praticiens publiés' },
  { key: 'associations_publiees', label: 'Associations publiées' },
  { key: 'suggestions_praticiens', label: 'Suggestions praticiens' },
  { key: 'suggestions_associations', label: 'Suggestions associations' },
  { key: 'suggestions_livres', label: 'Suggestions livres' },
  { key: 'signalements_ouverts', label: 'Signalements ouverts' },
  { key: 'livres', label: 'Livres publiés' },
  { key: 'videos', label: 'Vidéos / chaînes' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo-tsa.svg" alt="" class="h-6 w-auto">
          <span class="font-bold text-gray-900">Statistiques</span>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/admin"
            class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Administration
          </NuxtLink>
          <NuxtLink
            to="/"
            class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Voir le site
          </NuxtLink>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-8">
      <p class="text-sm text-gray-500 mb-6 max-w-2xl leading-relaxed">
        Visites mesurées côté navigateur (sans cookie). Les robots et crawlers
        qui n’exécutent pas JavaScript ne sont en principe pas comptés ;
        les User-Agent suspects sont aussi filtrés côté serveur.
        Actualisation automatique chaque minute.
      </p>

      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="p in periodes"
          :key="p.id"
          type="button"
          class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
          :class="periode === p.id
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
          @click="periode = p.id"
        >
          {{ p.label }}
        </button>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 mb-6">
        {{ error }}
      </div>

      <div v-if="loading && !data" class="text-sm text-gray-500 py-12 text-center">
        Chargement…
      </div>

      <template v-if="data">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-white border border-gray-200 rounded-2xl p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Aujourd’hui</p>
            <p class="text-3xl font-black text-gray-900 mt-1 tabular-nums">
              {{ data.visites.aujourdhui.toLocaleString('fr-FR') }}
            </p>
          </div>
          <div class="bg-white border border-gray-200 rounded-2xl p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Période ({{ periodes.find(p => p.id === periode)?.label }})
            </p>
            <p class="text-3xl font-black text-gray-900 mt-1 tabular-nums">
              {{ data.visites.periode.toLocaleString('fr-FR') }}
            </p>
          </div>
          <div class="bg-white border border-gray-200 rounded-2xl p-5 col-span-2 sm:col-span-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Depuis</p>
            <p class="text-lg font-semibold text-gray-900 mt-2">
              {{ data.depuis }}
            </p>
          </div>
        </div>

        <!-- Série (barres simples) -->
        <section class="bg-white border border-gray-200 rounded-2xl p-5 mb-8">
          <h2 class="text-sm font-bold text-gray-900 mb-4">Visites par jour</h2>
          <div
            v-if="data.visites.serie.length === 0"
            class="text-sm text-gray-500"
          >
            Aucune visite enregistrée sur cette période.
          </div>
          <div
            v-else
            class="flex items-end gap-0.5 h-32 overflow-x-auto"
            role="img"
            :aria-label="`Histogramme des visites sur ${data.jours} jours`"
          >
            <div
              v-for="pt in data.visites.serie"
              :key="pt.jour"
              class="flex-1 min-w-[4px] max-w-[24px] bg-gray-200 rounded-t hover:bg-gray-400 transition-colors"
              :style="{ height: `${Math.max(2, (pt.hits / maxSerie) * 100)}%` }"
              :title="`${pt.jour} : ${pt.hits}`"
            />
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <section class="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 class="text-sm font-bold text-gray-900 mb-4">Pages les plus vues</h2>
            <ul v-if="data.visites.top_pages.length" class="divide-y divide-gray-100">
              <li
                v-for="row in data.visites.top_pages"
                :key="row.path"
                class="flex items-center justify-between gap-4 py-2.5 text-sm"
              >
                <code class="text-gray-800 truncate">{{ row.path }}</code>
                <span class="tabular-nums font-semibold text-gray-900 shrink-0">
                  {{ row.hits.toLocaleString('fr-FR') }}
                </span>
              </li>
            </ul>
            <p v-else class="text-sm text-gray-500">Pas encore de données.</p>
          </section>

          <section class="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 class="text-sm font-bold text-gray-900 mb-4">Volumes métier</h2>
            <ul class="divide-y divide-gray-100">
              <li
                v-for="item in labelsMetier"
                :key="item.key"
                class="flex items-center justify-between gap-4 py-2.5 text-sm"
              >
                <span class="text-gray-700">{{ item.label }}</span>
                <span class="tabular-nums font-semibold text-gray-900">
                  {{ (data.metier[item.key] ?? 0).toLocaleString('fr-FR') }}
                </span>
              </li>
            </ul>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>
