<script setup lang="ts">
import type { Association } from '~/types/index'

useSeoMeta({
  title: 'Associations TSA — Annuaire TSA',
  description: 'Trouvez une association spécialisée dans les troubles du spectre autistique près de chez vous. Associations de familles, de personnes concernées et de professionnels TSA en France.'
})

const { fetchAssociations } = useApi()

const { data, status } = await useAsyncData('associations', fetchAssociations, { server: false })

const associations = computed<Association[]>(() => data.value ?? [])

const route = useRoute()
const router = useRouter()

// État initialisé depuis l'URL (restauré au retour navigateur, partageable par lien)
const search = ref((route.query.q as string) || '')
const filtreDept = ref((route.query.dept as string) || '')

const associationsFiltrees = computed(() => {
  const q = search.value.toLowerCase().trim()
  const d = filtreDept.value.trim()
  return associations.value.filter(a => {
    const matchQ = !q || a.nom.toLowerCase().includes(q) || a.ville.toLowerCase().includes(q) || a.departement.includes(q) || (a.services ?? '').toLowerCase().includes(q)
    const matchD = !d || a.departement === d
    return matchQ && matchD
  })
})

const PAGE_SIZE = 20
const page = ref(Number(route.query.page) || 1)

// Un changement de filtre revient à la page 1
watch([search, filtreDept], () => { page.value = 1 })

// Reflète l'état (page + filtres) dans l'URL pour le restaurer au retour navigateur
watch([search, filtreDept, page], () => {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.q = search.value.trim()
  if (filtreDept.value.trim()) query.dept = filtreDept.value.trim()
  if (page.value > 1) query.page = String(page.value)
  router.replace({ query })
})

const totalPages = computed(() => Math.ceil(associationsFiltrees.value.length / PAGE_SIZE))
// Borne la page si l'URL restaurée dépasse le nombre de pages disponibles
const pageActuelle = computed(() => Math.min(Math.max(page.value, 1), Math.max(totalPages.value, 1)))
const associationsPaginees = computed(() => associationsFiltrees.value.slice((pageActuelle.value - 1) * PAGE_SIZE, pageActuelle.value * PAGE_SIZE))

function scrollTop() {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function initiales(nom: string) {
  const words = nom.trim().split(' ').filter(w => w.length > 2)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return nom.substring(0, 2).toUpperCase()
}
</script>

<template>
  <div>

    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-20 text-center" style="background: linear-gradient(160deg, #f0fdf4 0%, #f0f9ff 40%, #fdf4ff 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 20% 50%, rgba(74,222,128,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(99,102,241,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-4xl mx-auto px-6">
        <div class="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 text-gray-700 text-sm font-medium mb-8">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
          {{ associations.length }} associations référencées
        </div>
        <h1 class="text-5xl sm:text-6xl font-black text-gray-900 mb-5 tracking-tight leading-tight">
          Associations<br>
          <span style="background: linear-gradient(90deg, #4ade80 0%, #60a5fa 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">TSA en France</span>
        </h1>
        <p class="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
          Associations de familles, de personnes concernées et de professionnels spécialisés dans les troubles du spectre autistique.
        </p>
      </div>
    </section>

    <!-- CONTENU -->
    <section class="bg-gray-50 py-12">
      <div class="max-w-5xl mx-auto px-6">

        <!-- RECHERCHE -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
              <input
                v-model="search"
                type="search"
                aria-label="Rechercher une association par nom, ville, département ou service"
                placeholder="Nom, ville, département, service…"
                class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
              />
            </div>
            <input
              v-model="filtreDept"
              type="text"
              aria-label="Filtrer par numéro de département"
              placeholder="N° département (ex: 75)"
              maxlength="3"
              class="w-full sm:w-44 px-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
            />
          </div>
        </div>

        <!-- CHARGEMENT -->
        <div v-if="status === 'pending'" class="flex justify-center py-16">
          <svg class="animate-spin text-gray-400 w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>

        <template v-else>
          <p class="text-sm font-semibold text-gray-600 mb-5 px-1">
            {{ associationsFiltrees.length }} association{{ associationsFiltrees.length > 1 ? 's' : '' }} trouvée{{ associationsFiltrees.length > 1 ? 's' : '' }}
            <span v-if="totalPages > 1"> — page {{ pageActuelle }} / {{ totalPages }}</span>
          </p>

          <div v-if="associationsFiltrees.length === 0" class="text-center py-16 text-gray-400">
            Aucune association pour ces critères.
          </div>

          <!-- LISTE -->
          <div v-else class="space-y-4">
            <NuxtLink
              v-for="a in associationsPaginees"
              :key="a.id"
              :to="`/association/${a.id}`"
              class="block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200 p-6"
            >
              <div class="flex items-start gap-4">

                <!-- Avatar -->
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0" style="background: linear-gradient(135deg, #10b981, #059669)">
                  {{ initiales(a.nom) }}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3 flex-wrap mb-1">
                    <h2 class="font-black text-gray-900 text-lg leading-tight">{{ a.nom }}</h2>
                    <span class="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg shrink-0">{{ a.departement }}</span>
                  </div>

                  <!-- Ville + type -->
                  <p class="text-gray-600 text-sm mb-3">
                    <span v-if="a.ville">{{ a.ville }} · </span>
                    <span v-if="a.type_association" class="text-gray-500">{{ a.type_association }}</span>
                  </p>

                  <!-- Services -->
                  <div v-if="a.services" class="flex flex-wrap gap-1.5 mb-3">
                    <span
                      v-for="service in a.services.split(',').slice(0, 4)"
                      :key="service"
                      class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                    >{{ service.trim() }}</span>
                  </div>

                  <!-- Age public -->
                  <p v-if="a.age_public" class="text-xs text-gray-500 mb-3">
                    <span class="font-semibold">Public :</span> {{ a.age_public }}
                  </p>

                  <!-- Description -->
                  <p v-if="a.description" class="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                    {{ a.description }}
                  </p>

                  <!-- Contacts -->
                  <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <a v-if="a.telephone" :href="`tel:${a.telephone}`" class="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                      📞 {{ a.telephone }}
                    </a>
                    <a v-if="a.email" :href="`mailto:${a.email}`" class="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors min-w-0">
                      ✉️ <span class="truncate max-w-[200px]">{{ a.email }}</span>
                    </a>
                    <a v-if="a.site_web" :href="a.site_web" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
                      🔗 Site web
                    </a>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- PAGINATION -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button type="button"
              :disabled="pageActuelle === 1"
              class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-gray-400 transition-colors"
              @click="page = pageActuelle - 1; scrollTop()"
            >← Précédent</button>
            <div class="flex gap-1 flex-wrap justify-center">
              <template v-for="p in totalPages" :key="p">
                <button type="button"
                  v-if="p === 1 || p === totalPages || (p >= pageActuelle - 2 && p <= pageActuelle + 2)"
                  class="w-9 h-9 rounded-lg text-sm font-semibold border transition-colors"
                  :class="p === pageActuelle ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'"
                  @click="page = p; scrollTop()"
                >{{ p }}</button>
                <span v-else-if="p === pageActuelle - 3 || p === pageActuelle + 3" class="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
              </template>
            </div>
            <button type="button"
              :disabled="pageActuelle === totalPages"
              class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-gray-400 transition-colors"
              @click="page = pageActuelle + 1; scrollTop()"
            >Suivant →</button>
          </div>
        </template>

      </div>
    </section>

  </div>
</template>
