<script setup lang="ts">
import type { Praticien } from '~/types/index'
import { TYPES_PRATICIENS, AGES_OPTIONS } from '~/types/index'
import { initiales, isNew } from '~/composables/usePraticien'

useSeoMeta({
  title: 'Annuaire TSA / Autisme — Trouvez un spécialiste près de chez vous',
  description: 'Annuaire collaboratif et gratuit de praticiens spécialisés en autisme et TSA (troubles du spectre autistique) en France.'
})

const { fetchPraticiens } = useApi()

const { data: praticiens, status } = await useAsyncData('praticiens', fetchPraticiens, {
  server: false
})

const route = useRoute()
const router = useRouter()

// État initialisé depuis l'URL (restauré au retour navigateur, partageable par lien)
const search = ref((route.query.q as string) || '')
const filtreType = ref((route.query.type as string) || 'tous')
const filtreAge = ref((route.query.age as string) || 'tous')
const filtreTele = ref((route.query.tele as string) || 'tous')

const types = TYPES_PRATICIENS
const ages = AGES_OPTIONS

const howItWorks = [
  { titre: 'Trouver un spécialiste', desc: 'Recherchez par ville, département ou spécialité. Filtrez selon vos besoins.', emoji: '🔍', bg: 'bg-indigo-50 border-indigo-100', iconBg: 'bg-indigo-100' },
  { titre: 'Suggérer un praticien', desc: "Vous connaissez un spécialiste qui n'apparaît pas ? Ajoutez-le en quelques clics.", emoji: '➕', bg: 'bg-emerald-50 border-emerald-100', iconBg: 'bg-emerald-100' },
  { titre: 'Veiller à la qualité', desc: 'Confirmez ou signalez les fiches pour aider la communauté.', emoji: '🛡️', bg: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100' },
]

const specialites = [
  { nom: 'Psychiatre', emoji: '🧠' },
  { nom: 'Psychologue', emoji: '💬' },
  { nom: 'Orthophoniste', emoji: '🗣️' },
  { nom: 'Ergothérapeute', emoji: '🤲' },
]

const PAGE_SIZE = 20
const page = ref(Number(route.query.page) || 1)

const praticiensFiltres = computed(() => {
  if (!praticiens.value) return []
  const q = search.value.toLowerCase().trim()
  return praticiens.value.filter((p: Praticien) => {
    const matchQ = !q || p.ville.toLowerCase().includes(q) || p.departement.includes(q) || p.nom.toLowerCase().includes(q)
    const matchT = filtreType.value === 'tous' || p.type === filtreType.value
    const matchA = filtreAge.value === 'tous' || p.ages.includes(filtreAge.value)
    const matchL = filtreTele.value === 'tous' || (filtreTele.value === 'oui' && p.teleconsultation)
    return matchQ && matchT && matchA && matchL
  })
})

const totalPages = computed(() => Math.ceil(praticiensFiltres.value.length / PAGE_SIZE))
// Borne la page si l'URL restaurée dépasse le nombre de pages disponibles
const pageActuelle = computed(() => Math.min(Math.max(page.value, 1), Math.max(totalPages.value, 1)))
const praticiensPagines = computed(() => praticiensFiltres.value.slice((pageActuelle.value - 1) * PAGE_SIZE, pageActuelle.value * PAGE_SIZE))

// Un changement de filtre revient à la page 1
watch([search, filtreType, filtreAge, filtreTele], () => { page.value = 1 })

// Reflète l'état (page + filtres) dans l'URL pour le restaurer au retour navigateur
watch([search, filtreType, filtreAge, filtreTele, page], () => {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.q = search.value.trim()
  if (filtreType.value !== 'tous') query.type = filtreType.value
  if (filtreAge.value !== 'tous') query.age = filtreAge.value
  if (filtreTele.value !== 'tous') query.tele = filtreTele.value
  if (page.value > 1) query.page = String(page.value)
  router.replace({ query })
})

function scrollToAnnuaire() {
  if (import.meta.client) {
    const el = document.getElementById('annuaire')
    if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
  }
}
</script>

<template>
  <div>

    <!-- HERO -->
    <section class="relative overflow-hidden py-24 text-center" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 15% 50%, rgba(239,68,68,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 30%, rgba(99,102,241,0.07) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(74,222,128,0.05) 0%, transparent 50%)" />
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />

      <div class="relative max-w-4xl mx-auto px-6">
        <div class="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 text-gray-700 text-sm font-medium mb-10">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
          Annuaire collaboratif · Gratuit · Sans inscription
        </div>

        <h1 class="text-5xl sm:text-7xl font-black leading-tight mb-6 tracking-tight text-gray-900">
          Trouvez un<br />
          <span style="background: linear-gradient(90deg, #f87171 0%, #fb923c 20%, #fbbf24 40%, #4ade80 60%, #60a5fa 80%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">spécialiste en autisme</span><br />
          près de chez vous
        </h1>

        <p class="text-gray-700 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Psychiatres, psychologues, neuropsychologues, orthophonistes,<br class="hidden sm:block" /> ergothérapeutes et psychomotriciens spécialisés en autisme et TSA.
        </p>

        <div class="flex flex-wrap justify-center gap-4">
          <a href="#annuaire" class="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors text-lg inline-flex items-center gap-2">
            🔍 Rechercher un praticien
          </a>
          <NuxtLink to="/suggerer" class="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors text-lg inline-flex items-center gap-2">
            + Suggérer un praticien
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="py-12 text-white" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)">
      <div class="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div>
          <div class="text-5xl font-black mb-1">100%</div>
          <div class="text-indigo-200 text-sm font-medium uppercase tracking-wider">Gratuit</div>
        </div>
        <div>
          <div class="text-5xl font-black mb-1">0</div>
          <div class="text-indigo-200 text-sm font-medium uppercase tracking-wider">Publicité</div>
        </div>
        <div>
          <div class="text-5xl font-black mb-1">✏️</div>
          <div class="text-indigo-200 text-sm font-medium uppercase tracking-wider">Sans inscription</div>
        </div>
      </div>
    </section>

    <!-- COMMENT ÇA MARCHE -->
    <section class="bg-white py-20">
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center mb-14">
          <span class="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Comment ça marche ?</span>
          <h2 class="text-4xl font-black text-gray-900 mt-3">Un projet fait pour les familles,<br />nourri par les familles.</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div v-for="item in howItWorks" :key="item.titre"
            class="rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default"
            :class="item.bg">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl" :class="item.iconBg">
              {{ item.emoji }}
            </div>
            <h3 class="font-bold text-gray-900 text-lg mb-2">{{ item.titre }}</h3>
            <p class="text-gray-700 text-sm leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ANNUAIRE -->
    <section id="annuaire" class="bg-gray-50 py-20">
      <div class="max-w-4xl mx-auto px-6">

        <div class="text-center mb-10">
          <span class="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Annuaire</span>
          <h2 class="text-3xl font-black text-gray-900 mt-2">Trouver un praticien</h2>
        </div>

        <!-- Barre de recherche + filtres -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <div class="relative mb-4">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
            <input
              v-model="search"
              type="search"
              aria-label="Rechercher un praticien par ville, département ou nom"
              placeholder="Bordeaux, 33, Dr Dupont…"
              class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
            />
          </div>

          <div class="flex flex-wrap gap-2 mb-3">
            <button type="button"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="filtreType === 'tous' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="filtreType = 'tous'"
            >Tous</button>
            <button type="button"
              v-for="t in types"
              :key="t"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="filtreType === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="filtreType = t"
            >{{ t }}</button>
          </div>

          <div class="flex flex-wrap gap-2 mb-3">
            <button type="button"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="filtreAge === 'tous' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="filtreAge = 'tous'"
            >Tous âges</button>
            <button type="button"
              v-for="a in ages"
              :key="a"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="filtreAge === a ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="filtreAge = a"
            >{{ a }}</button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button type="button"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="filtreTele === 'tous' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="filtreTele = 'tous'"
            >Présentiel & télé</button>
            <button type="button"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="filtreTele === 'oui' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="filtreTele = 'oui'"
            >Téléconsultation uniquement</button>
          </div>
        </div>

        <!-- États -->
        <div v-if="status === 'pending' || status === 'idle'" class="text-center py-16 text-gray-500 text-sm">
          Chargement de l'annuaire…
        </div>

        <div v-else-if="status === 'error'" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          Impossible de charger les praticiens. Réessayez dans quelques instants.
        </div>

        <template v-else>
          <p class="text-sm font-semibold text-gray-500 mb-4 px-2">
            {{ praticiensFiltres.length }} praticien{{ praticiensFiltres.length > 1 ? 's' : '' }} trouvé{{ praticiensFiltres.length > 1 ? 's' : '' }}
            <span v-if="totalPages > 1"> — page {{ pageActuelle }} / {{ totalPages }}</span>
          </p>

          <div v-if="praticiensFiltres.length === 0" class="text-center py-16 text-gray-500">
            Aucun résultat pour ces critères.
          </div>

          <div v-else class="space-y-3">
            <NuxtLink
              v-for="p in praticiensPagines"
              :key="p.id"
              :to="`/praticien/${p.id}`"
              class="block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 p-6"
            >
              <div class="flex items-start gap-5">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-base shrink-0" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
                  {{ initiales(p.nom) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="font-black text-gray-900 text-lg">{{ p.nom }}</span>
                    <span v-if="isNew(p.created_at)" class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">● Nouveau</span>
                  </div>
                  <p class="text-gray-700 text-sm mb-3">{{ p.type }} · {{ p.ville }} ({{ p.departement }})</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="age in p.ages" :key="age" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{{ age }}</span>
                    <span v-if="p.teleconsultation" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Téléconsultation</span>
                    <span v-if="p.delai" class="px-2.5 py-1 text-xs font-medium rounded-full" :class="p.delai === 'Disponible' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">Délai : {{ p.delai }}</span>
                  </div>
                </div>
                <div class="hidden sm:flex flex-col items-end gap-2 shrink-0">
                  <button type="button" class="text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors" @click.prevent.stop="navigateTo(`/departement/${p.departement}`)">Dép. {{ p.departement }}</button>
                  <span v-if="p.confirmations > 0" class="text-xs text-emerald-700 font-medium">✓ {{ p.confirmations }} confirmation{{ p.confirmations > 1 ? 's' : '' }}</span>
                </div>
              </div>
              <div class="border-t border-gray-100 mt-5 pt-4 flex items-center justify-between">
                <span v-if="p.telephone" class="text-sm font-semibold text-indigo-600 flex items-center gap-1.5">
                  📞 {{ p.telephone }}
                </span>
                <span v-else class="text-sm text-gray-600">Téléphone non renseigné</span>
                <span class="text-xs text-gray-600">Voir la fiche →</span>
              </div>
            </NuxtLink>
          </div>

          <!-- PAGINATION -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button type="button"
              :disabled="pageActuelle === 1"
              class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-gray-400 transition-colors"
              @click="page = pageActuelle - 1; scrollToAnnuaire()"
            >← Précédent</button>
            <div class="flex gap-1 flex-wrap justify-center">
              <template v-for="p in totalPages" :key="p">
                <button type="button"
                  v-if="p === 1 || p === totalPages || (p >= pageActuelle - 2 && p <= pageActuelle + 2)"
                  class="w-9 h-9 rounded-lg text-sm font-semibold border transition-colors"
                  :class="p === pageActuelle ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'"
                  @click="page = p; scrollToAnnuaire()"
                >{{ p }}</button>
                <span v-else-if="p === pageActuelle - 3 || p === pageActuelle + 3" class="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
              </template>
            </div>
            <button type="button"
              :disabled="pageActuelle === totalPages"
              class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-gray-400 transition-colors"
              @click="page = pageActuelle + 1; scrollToAnnuaire()"
            >Suivant →</button>
          </div>
        </template>
      </div>
    </section>

    <!-- SUGGÉRER -->
    <section class="relative overflow-hidden py-20" style="background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)">
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 80% 50%, rgba(167,139,250,0.15) 0%, transparent 60%)" />
      <div class="absolute top-8 left-8 w-2 h-2 rounded-full bg-purple-400 opacity-40" />
      <div class="absolute bottom-12 right-12 w-3 h-3 rounded-full bg-indigo-400 opacity-30" />
      <div class="absolute top-1/2 left-1/4 w-1.5 h-1.5 rounded-full bg-violet-300 opacity-25" />

      <div class="relative max-w-4xl mx-auto px-6">
        <div class="text-center max-w-2xl mx-auto text-white">
          <div class="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-5">
            Communauté
          </div>
          <h2 class="text-4xl font-black mb-4 leading-tight">Vous connaissez un praticien qui n'apparaît pas ?</h2>
          <p class="text-indigo-200 text-lg leading-relaxed mb-8">Aidez la communauté. Nom, ville et spécialité suffisent — c'est rapide et gratuit.</p>
          <NuxtLink to="/suggerer" class="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
            Suggérer un praticien →
          </NuxtLink>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          <div v-for="s in specialites" :key="s.nom"
            class="bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-center hover:bg-white/10 hover:border-white/20 transition-all">
            <div class="text-3xl mb-2">{{ s.emoji }}</div>
            <div class="text-white text-sm font-semibold">{{ s.nom }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- QUALITÉ -->
    <section class="py-20 text-center" style="background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)">
      <div class="max-w-4xl mx-auto px-6">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto text-2xl" style="background: linear-gradient(135deg, #fb923c, #f59e0b)">
          🛡️
        </div>
        <h2 class="text-3xl font-black text-gray-900 mb-4">Veiller à la qualité ensemble</h2>
        <p class="text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">Confirmez l'exactitude des fiches ou signalez une erreur. Chaque contribution aide les familles à trouver le bon praticien.</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <div class="flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm">
            ✅ Confirmer une fiche
          </div>
          <div class="flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm">
            🚩 Signaler une erreur
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
