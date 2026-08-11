<script setup lang="ts">
import { CATEGORIES_VIDEOS, type Video } from '~/types/index'

useSeoMeta({
  title: 'Vidéos TSA — Chaînes et vidéos sur l\'autisme',
  description: 'Chaînes YouTube et vidéos sur l\'autisme, choisies une par une. Le lecteur ne se charge qu\'à votre demande : aucune donnée n\'est transmise avant.'
})

const { fetchVideos } = useApi()
// server: false — sans quoi le prérendu fige « aucun résultat » dans le HTML.
const { data: videos, status } = await useAsyncData('videos', fetchVideos, { server: false })

const search = ref('')
const activeCat = ref('')

const filtrees = computed(() => {
  const q = normaliserRecherche(search.value).trim()
  return (videos.value ?? []).filter((v: Video) => {
    const match = !q || normaliserRecherche(`${v.titre} ${v.chaine} ${v.pourquoi}`).includes(q)
    return match && (!activeCat.value || v.categorie === activeCat.value)
  })
})

const chaines = computed(() => filtrees.value.filter(v => v.type === 'chaine'))
const clips = computed(() => filtrees.value.filter(v => v.type === 'video'))

const chargement = computed(() => status.value === 'pending' || status.value === 'idle')

const COULEURS: Record<string, string> = {
  professionnels: 'bg-indigo-50 text-indigo-700',
  concernees: 'bg-emerald-50 text-emerald-700',
  familles: 'bg-orange-50 text-orange-700'
}
function libelle(id: string) {
  return CATEGORIES_VIDEOS.find(c => c.id === id)?.label ?? id
}

// Initiales de la chaîne, à la place d'un avatar distant : héberger des images
// supposerait un dossier accessible en écriture, et les charger depuis Google
// contredirait tout le dispositif.
function initiales(nom: string) {
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map(m => m.charAt(0).toUpperCase()).join('')
}
const DEGRADES = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #0ea5e9, #22c55e)',
  'linear-gradient(135deg, #f59e0b, #f472b6)'
]
function degrade(nom: string) {
  let somme = 0
  for (const c of nom) somme += c.charCodeAt(0)
  return DEGRADES[somme % DEGRADES.length]
}
</script>

<template>
  <div>

    <!-- HERO -->
    <section class="relative overflow-hidden py-20 text-center" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 15% 50%, rgba(239,68,68,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 30%, rgba(99,102,241,0.07) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(74,222,128,0.05) 0%, transparent 50%)" />
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />

      <div class="relative max-w-4xl mx-auto px-6">
        <div class="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 text-gray-500 text-sm font-medium mb-8">
          🎬 Sélection éditoriale · Sans publicité
        </div>
        <h1 class="text-4xl sm:text-6xl font-black leading-tight mb-5 tracking-tight text-gray-900">
          Comprendre l'autisme<br />
          <span style="background: linear-gradient(90deg, #f472b6 0%, #a78bfa 50%, #60a5fa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">en vidéo</span>
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Des chaînes et des vidéos choisies une par une. Tout le monde n'a pas le temps
          ou la disponibilité de lire trois cents pages — le livre et la vidéo se
          complètent, ils ne se remplacent pas.
        </p>
        <RessourcesOnglets />
      </div>
    </section>

    <!-- RECHERCHE + FILTRES -->
    <section class="bg-gray-50 py-10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div class="relative mb-4">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
            <input v-model="search" type="search" aria-label="Rechercher une vidéo, une chaîne ou un sujet" placeholder="Une vidéo, une chaîne, un sujet…"
              class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="activeCat === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="activeCat = ''">Tout</button>
            <button type="button" v-for="c in CATEGORIES_VIDEOS" :key="c.id"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="activeCat === c.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="activeCat = c.id">{{ c.label }}</button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="chargement" class="bg-white py-16 text-center text-gray-500 text-sm">
      Chargement des ressources…
    </div>

    <template v-else>

      <!-- CHAÎNES -->
      <section class="bg-white py-16">
        <div class="max-w-5xl mx-auto px-6">
          <div class="mb-10">
            <span class="text-violet-600 font-semibold text-sm uppercase tracking-wider">À suivre</span>
            <h2 class="text-3xl font-black text-gray-900 mt-2">Chaînes</h2>
            <p class="text-gray-500 mt-2 max-w-2xl leading-relaxed">
              Ici, pas de lecteur : ces chaînes valent pour l'ensemble de ce qu'elles
              publient, pas pour une vidéo en particulier. Le lien ouvre YouTube dans un
              nouvel onglet.
            </p>
          </div>

          <div v-if="chaines.length === 0" class="text-center py-12 text-gray-500">
            Aucune chaîne pour ce filtre.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <article v-for="c in chaines" :key="c.id"
              class="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-13 h-13 shrink-0 rounded-full flex items-center justify-center text-white font-black" style="width:3.25rem;height:3.25rem" :style="{ background: degrade(c.chaine) }">
                  {{ initiales(c.chaine) }}
                </div>
                <div class="min-w-0">
                  <h3 class="font-bold text-gray-900 leading-snug">{{ c.titre }}</h3>
                  <p class="text-sm text-gray-500 truncate">{{ c.chaine }}</p>
                </div>
              </div>
              <span class="self-start px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3" :class="COULEURS[c.categorie]">{{ libelle(c.categorie) }}</span>
              <p class="text-sm text-gray-600 leading-relaxed border-l-3 border-violet-200 pl-3" style="border-left-width:3px">
                <span class="font-semibold text-gray-900">Pourquoi ici :</span> {{ c.pourquoi }}
              </p>
              <a v-if="c.url" :href="c.url" target="_blank" rel="noopener"
                class="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                Voir la chaîne sur YouTube ↗
              </a>
            </article>
          </div>
        </div>
      </section>

      <!-- VIDÉOS -->
      <section class="bg-gray-50 py-16">
        <div class="max-w-5xl mx-auto px-6">
          <div class="mb-10">
            <span class="text-indigo-600 font-semibold text-sm uppercase tracking-wider">À regarder</span>
            <h2 class="text-3xl font-black text-gray-900 mt-2">Vidéos</h2>
            <p class="text-gray-500 mt-2 max-w-2xl leading-relaxed">
              Le lecteur ne se charge qu'à votre demande : tant que vous ne cliquez pas,
              rien n'est transmis à YouTube.
            </p>
          </div>

          <div v-if="clips.length === 0" class="text-center py-12 text-gray-500">
            Aucune vidéo pour ce filtre.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <article v-for="v in clips" :key="v.id"
              class="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
              <VideoFacade v-if="v.youtube_id" :youtube-id="v.youtube_id" :titre="v.titre" :duree="v.duree" />
              <div class="p-5 flex flex-col flex-1">
                <span class="self-start px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2" :class="COULEURS[v.categorie]">{{ libelle(v.categorie) }}</span>
                <h3 class="font-bold text-gray-900 leading-snug">{{ v.titre }}</h3>
                <p class="text-sm text-gray-500 mt-1 mb-3">{{ v.chaine }}</p>
                <p class="text-sm text-gray-600 leading-relaxed border-l-3 border-violet-200 pl-3" style="border-left-width:3px">
                  <span class="font-semibold text-gray-900">Pourquoi ici :</span> {{ v.pourquoi }}
                </p>
                <p class="text-xs text-gray-400 mt-auto pt-3">Le lecteur ne se charge qu'à votre demande.</p>
              </div>
            </article>
          </div>

          <!-- La promesse faite aux praticiens contactés : ni publicité, ni traceur. -->
          <div class="flex gap-3 items-start bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mt-10">
            <span class="text-xl" aria-hidden="true">🔒</span>
            <p class="text-sm text-gray-600 leading-relaxed">
              <span class="font-semibold text-gray-900">Aucun traceur, aucune vidéo chargée à votre insu.</span>
              Les vignettes sont dessinées par le site : tant que vous ne lancez pas une
              vidéo, aucune information n'est transmise à Google. Les chaînes, elles, sont
              de simples liens.
            </p>
          </div>
        </div>
      </section>

    </template>

  </div>
</template>
