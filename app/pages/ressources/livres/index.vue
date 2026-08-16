<script setup lang="ts">
import type { Livre } from '~/types/index'

useSeoMeta({
  title: 'Livres TSA — Sélection de livres sur l\'autisme',
  description: 'Sélection collaborative et gratuite de livres sur le trouble du spectre autistique — grands classiques et dernières parutions.'
})

const { fetchLivres } = useApi()
const { data: livres, status } = await useAsyncData('livres', fetchLivres, {
  server: false
})

const search = ref('')
const activecat = ref('')

const categories = ['témoignage', 'guide pratique', 'scientifique', 'bd', 'jeunesse', 'roman']

const classiques = computed(() =>
  (livres.value ?? []).filter((l: Livre) => {
    const q = normaliserRecherche(search.value)
    const match = !q || normaliserRecherche(`${l.titre} ${l.auteur} ${l.description ?? ''} ${l.categorie ?? ''}`).includes(q)
    const cat = !activecat.value || l.categorie === activecat.value
    return l.type === 'classique' && match && cat
  })
)

function cleanTags(subjects?: string[]) {
  if (!subjects) return []
  return subjects.filter(s => !/[=:]/.test(s) && s.length < 40).slice(0, 2)
}

// Forme du proxy data.bnf.fr — seuls les champs effectivement lus sont typés,
// le reste de la réponse Open Library n'est pas utilisé.
interface DocBnf {
  title?: string
  language?: string[]
  first_publish_year?: number
  author_name?: string[]
  subject?: string[]
  key?: string
}

// Nouveautés data.bnf.fr via proxy — chargé côté client uniquement
// (le proxy PHP n'est pas joignable au prerender du build statique).
const config = useRuntimeConfig()
const { data: newReleases, status: newReleasesStatus } = await useAsyncData('newreleases', async () => {
  try {
    const res = await $fetch<{ docs?: DocBnf[] }>(`${config.public.apiBase}/bnf-proxy.php`)
    const docs = res.docs ?? []
    return docs
      .filter((d) => {
        if (!d.title) return false
        const langs = d.language ?? []
        if (langs.length > 0 && !langs.includes('fre') && !langs.includes('eng')) return false
        return (d.first_publish_year ?? 0) >= 2020
      })
      .slice(0, 9)
      .map((d) => {
        const langs = d.language ?? []
        return {
          titre: d.title,
          // Auteur souvent absent de la BnF (SPARQL partiel) : on laisse vide
          // plutôt que d'afficher un trompeur « Auteur inconnu ».
          auteur: (d.author_name ?? []).slice(0, 2).join(', '),
          annee: d.first_publish_year,
          tags: cleanTags(d.subject),
          flag: langs.includes('fre') ? '🇫🇷' : '🇬🇧',
          lien: d.key
        }
      })
  } catch {
    return []
  }
}, { lazy: true, server: false })

// 'idle' est l'état au pré-rendu, 'pending' le premier état côté client. Sans
// 'idle', la page statique affirmait « Aucune nouveauté trouvée » — faux, et
// c'est ce que voyaient les moteurs et les visiteurs sans JavaScript — puis
// divergeait du rendu client à l'hydratation.
const loadingNewReleases = computed(() =>
  newReleasesStatus.value === 'pending' || newReleasesStatus.value === 'idle'
)
</script>

<template>
  <div>

    <!-- HERO -->
    <section class="relative overflow-hidden py-20 text-center" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 15% 50%, rgba(239,68,68,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 30%, rgba(99,102,241,0.07) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(74,222,128,0.05) 0%, transparent 50%)" />
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />

      <div class="relative max-w-4xl mx-auto px-6">
        <div class="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 text-gray-500 text-sm font-medium mb-8">
          📚 Bibliothèque collaborative · Gratuit
        </div>
        <h1 class="text-4xl sm:text-6xl font-black leading-tight mb-5 tracking-tight text-gray-900">
          Trouvez le bon<br />
          <span style="background: linear-gradient(90deg, #f87171 0%, #fb923c 25%, #fbbf24 50%, #4ade80 75%, #60a5fa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">livre sur le TSA</span>
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Sélection collaborative et gratuite de livres sur le trouble du spectre autistique — grands classiques et dernières parutions.
        </p>
        <NuxtLink to="/ressources/livres/suggerer" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors">
          + Suggérer un livre
        </NuxtLink>
        <RessourcesOnglets />
      </div>
    </section>

    <!-- RECHERCHE + FILTRES -->
    <section class="bg-gray-50 py-10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
          <div class="relative mb-4">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
            <input v-model="search" type="search" aria-label="Rechercher un livre par titre, auteur ou mot-clé" placeholder="Titre, auteur ou mot-clé…"
              class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="activecat === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="activecat = ''">Tous</button>
            <button type="button" v-for="cat in categories" :key="cat"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="[activecat === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400', cat === 'bd' ? 'uppercase' : 'capitalize']"
              @click="activecat = cat">{{ cat }}</button>
          </div>
        </div>
      </div>
    </section>

    <!-- GRANDS CLASSIQUES -->
    <section class="bg-white py-16">
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center mb-10">
          <span class="text-amber-600 font-semibold text-sm uppercase tracking-wider">⭐ Sélection éditoriale</span>
          <h2 class="text-3xl font-black text-gray-900 mt-2">Grands classiques</h2>
          <p class="text-gray-500 mt-2">Les incontournables recommandés par la communauté</p>
        </div>

        <div v-if="status === 'pending' || status === 'idle'" class="text-center py-8 text-gray-500 text-sm">
          Chargement des livres…
        </div>

        <div v-else-if="classiques.length === 0" class="text-center py-12 text-gray-500">
          Aucun classique pour ce filtre.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="livre in classiques" :key="livre.id"
            class="bg-amber-50 rounded-2xl border border-amber-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div class="flex gap-3">
              <div class="w-14 h-20 rounded-xl flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-sm" style="background: linear-gradient(135deg, #fb923c, #f59e0b)">
                {{ livre.titre.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-sm leading-snug text-gray-900">{{ livre.titre }}</h3>
                <p class="text-xs text-gray-500 mt-0.5">{{ livre.auteur }}{{ livre.annee ? ` · ${livre.annee}` : '' }}</p>
                <p v-if="livre.description" class="text-xs text-gray-600 mt-2 line-clamp-3">{{ livre.description }}</p>
                <div class="mt-3">
                  <span v-if="livre.categorie" class="px-2 py-0.5 bg-white/80 text-amber-700 text-xs font-medium rounded-full" :class="livre.categorie === 'bd' ? 'uppercase' : 'capitalize'">{{ livre.categorie }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DERNIÈRES PARUTIONS -->
    <section class="bg-gray-50 py-16">
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center mb-10">
          <span class="text-emerald-600 font-semibold text-sm uppercase tracking-wider">🆕 Mis à jour quotidiennement</span>
          <h2 class="text-3xl font-black text-gray-900 mt-2">Dernières parutions</h2>
          <p class="text-gray-500 mt-2">Mises à jour automatiquement depuis data.bnf.fr (BnF)</p>
        </div>

        <div v-if="loadingNewReleases" class="flex justify-center py-8">
          <svg class="animate-spin text-gray-400 w-8 h-8" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
        <div v-else-if="!newReleases || newReleases.length === 0" class="text-center py-12 text-gray-500">
          Aucune nouveauté trouvée pour le moment.
        </div>

        <div v-else-if="newReleases && newReleases.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="(livre, i) in newReleases" :key="i"
            class="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div class="flex gap-3">
              <div class="w-14 h-20 rounded-xl flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-sm" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
                {{ livre.titre.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-sm leading-snug text-gray-900">{{ livre.titre }}</h3>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ livre.flag }}
                  <span v-if="livre.auteur">{{ livre.auteur }}</span>
                  <span v-if="livre.auteur && livre.annee"> · </span>
                  <span v-if="livre.annee">{{ livre.annee }}</span>
                </p>
                <div class="flex flex-wrap gap-1 mt-2">
                  <span v-for="tag in livre.tags" :key="tag" class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
