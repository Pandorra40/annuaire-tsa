<script setup lang="ts">
import type { Praticien } from '~/types/index'
import { slugVille, titreDepuisSlug } from '~/utils/villeSlug'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { fetchPraticiens } = useApi()

const { data: tous, status } = await useAsyncData(`praticiens-ville-${slug.value}`, fetchPraticiens)

const fraiche = ref<Praticien[] | null>(null)
onMounted(() => {
  const run = async () => {
    try {
      const r = await fetchPraticiens()
      if (r) fraiche.value = r
    } catch { /* garder prérendu */ }
  }
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(() => { void run() }, { timeout: 4000 })
  else setTimeout(() => { void run() }, 1500)
})

function matchVille(p: Praticien, s: string): boolean {
  if (p.ville && slugVille(p.ville) === s) return true
  if (p.ville2 && slugVille(p.ville2) === s) return true
  return false
}

const praticiens = computed(() =>
  (fraiche.value ?? tous.value ?? []).filter(p => matchVille(p, slug.value))
)

const nomVille = computed(() => {
  const p = praticiens.value[0]
  if (p?.ville && slugVille(p.ville) === slug.value) return p.ville
  if (p?.ville2 && slugVille(p.ville2) === slug.value) return p.ville2
  return titreDepuisSlug(slug.value)
})

const dept = computed(() => {
  const p = praticiens.value[0]
  if (!p) return ''
  if (p.ville && slugVille(p.ville) === slug.value) return p.departement
  return p.departement2 || p.departement
})

usePageSeo({
  title: computed(() => `Praticiens TSA à ${nomVille.value} — Annuaire TSA`),
  description: computed(() =>
    `Trouvez un praticien spécialisé autisme / TSA à ${nomVille.value}${dept.value ? ` (${dept.value})` : ''}. Annuaire collaboratif et gratuit.`
  ),
  path: computed(() => `/ville/${slug.value}`),
  noindex: computed(() => praticiens.value.length === 0)
})

const recherche = ref('')
const filtreType = ref('tous')
const filtreAge = ref('tous')
const filtreTele = ref('tous')
const filtreBilans = ref('tous')
const filtres = ref<{ passe: (p: Praticien) => boolean } | null>(null)

const praticiensFiltres = computed(() => {
  const test = filtres.value?.passe
  if (!test) return praticiens.value
  return praticiens.value.filter(test)
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden py-14" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="relative max-w-3xl mx-auto px-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Retour à l'annuaire
        </NuxtLink>
        <h1 class="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
          Spécialistes TSA à {{ nomVille }}
        </h1>
        <p class="text-gray-600 text-lg leading-relaxed max-w-2xl">
          Annuaire collaboratif de praticiens spécialisés dans l'autisme
          <span v-if="dept"> dans le département {{ dept }}</span>.
          Vérifiez toujours les informations auprès du professionnel avant un rendez-vous.
        </p>
        <p v-if="dept" class="mt-3">
          <NuxtLink :to="`/departement/${dept}`" class="text-indigo-600 hover:underline text-sm font-medium">
            Voir tout le département {{ dept }} →
          </NuxtLink>
        </p>
      </div>
    </section>

    <section class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-6">
        <div v-if="status === 'pending' && !tous" class="flex justify-center py-16">
          <svg class="animate-spin text-gray-400 w-10 h-10" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>

        <template v-else>
          <FiltresPraticiens
            ref="filtres"
            v-model:recherche="recherche"
            v-model:type="filtreType"
            v-model:age="filtreAge"
            v-model:tele="filtreTele"
            v-model:bilans="filtreBilans"
            :praticiens="praticiens"
            :placeholder="`Un nom à ${nomVille}…`"
            class="mb-6"
          />

          <p class="text-sm font-semibold text-gray-500 mb-4 px-2">
            {{ praticiensFiltres.length }} praticien{{ praticiensFiltres.length > 1 ? 's' : '' }}
          </p>

          <div v-if="praticiensFiltres.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 space-y-4 px-6">
            <p class="text-gray-700 font-medium">Aucun praticien référencé pour cette ville.</p>
            <p class="text-sm text-gray-600">Essayez le département, un CRA, ou suggérez un praticien que vous connaissez.</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <NuxtLink to="/cra" class="inline-flex px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50">CRA</NuxtLink>
              <NuxtLink to="/associations" class="inline-flex px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50">Associations</NuxtLink>
              <NuxtLink to="/suggerer" class="inline-flex px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold">
                Suggérer un praticien →
              </NuxtLink>
            </div>
          </div>

          <div v-else class="space-y-3">
            <CartePraticien v-for="p in praticiensFiltres" :key="p.id" :praticien="p" />
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
