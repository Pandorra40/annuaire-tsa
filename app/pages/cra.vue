<script setup lang="ts">
import { CENTRES_RESSOURCES, DESCRIPTION_INTIMAGIR, type CentreRessource } from '~/data/cra'

useSeoMeta({
  title: 'Centres Ressources Autisme (CRA) — Annuaire TSA',
  description: 'Trouvez le Centre Ressources Autisme de votre région et comprenez le parcours de diagnostic TSA en trois niveaux : repérage, diagnostic simple et situations complexes.'
})

const route = useRoute()
const router = useRouter()

const search = ref((route.query.q as string) || '')
const filtreCategorie = ref((route.query.cat as string) || '')

const CATEGORIES = [
  { valeur: '', label: 'Tous les centres' },
  { valeur: 'CRA', label: 'Centres Ressources Autisme' },
  { valeur: 'IntimAgir', label: 'IntimAgir' },
  { valeur: 'Autre', label: 'Spécialisés' }
] as const

const centresFiltres = computed(() => {
  const q = normaliserRecherche(search.value).trim()
  const cat = filtreCategorie.value
  return CENTRES_RESSOURCES.filter((c) => {
    const matchCat = !cat || c.categorie === cat
    if (!q) return matchCat
    const matchQ = normaliserRecherche(c.nom).includes(q)
      || normaliserRecherche(c.region).includes(q)
      || normaliserRecherche(c.ville ?? '').includes(q)
      || c.departements.some(d => d.toLowerCase() === q || d.toLowerCase().startsWith(q))
    return matchCat && matchQ
  })
})

// Regroupe par région pour un affichage structuré
const centresParRegion = computed(() => {
  const groupes = new Map<string, CentreRessource[]>()
  for (const centre of centresFiltres.value) {
    const liste = groupes.get(centre.region)
    if (liste) liste.push(centre)
    else groupes.set(centre.region, [centre])
  }
  return [...groupes.entries()].sort(([a], [b]) => {
    // « France entière » d'abord, « Outre-mer » en dernier
    if (a === 'France entière') return -1
    if (b === 'France entière') return 1
    if (a === 'Outre-mer') return 1
    if (b === 'Outre-mer') return -1
    return a.localeCompare(b, 'fr')
  })
})

watch([search, filtreCategorie], () => {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.q = search.value.trim()
  if (filtreCategorie.value) query.cat = filtreCategorie.value
  router.replace({ query })
})

const NIVEAUX = [
  {
    numero: 1,
    titre: 'Premières lignes',
    sousTitre: 'Le réseau d\'alerte',
    role: 'Repérer les premiers signes qui interrogent et orienter vers une évaluation.',
    acteurs: [
      'Petite enfance : crèches, assistantes maternelles, ATSEM',
      'Éducation nationale : enseignants, psychologues et médecins scolaires',
      'Médecine de ville : généralistes, pédiatres, orthophonistes, psychomotriciens'
    ],
    couleur: 'emerald',
    emoji: '👀'
  },
  {
    numero: 2,
    titre: 'Deuxièmes lignes',
    sousTitre: 'Le diagnostic',
    role: 'Poser le diagnostic dans les situations dites simples, en équipe pluridisciplinaire.',
    acteurs: [
      'Services hospitaliers de pédiatrie et pédopsychiatrie',
      'Équipes des CMP, CMPP, CAMSP et SAMSAH',
      'Professionnels libéraux coordonnés par un médecin'
    ],
    couleur: 'sky',
    emoji: '🔍'
  },
  {
    numero: 3,
    titre: 'Troisièmes lignes',
    sousTitre: 'Les situations complexes',
    role: 'Apporter un avis spécialisé quand le diagnostic est difficile ou fait débat.',
    acteurs: [
      'Centres Ressources Autisme (CRA)',
      'Unités d\'Évaluation Diagnostique (UEDE, UEDA)',
      'Centres hospitaliers spécialisés'
    ],
    couleur: 'violet',
    emoji: '🧩'
  }
] as const

// Classes Tailwind écrites en toutes lettres : le compilateur ne détecte pas les noms construits dynamiquement
const STYLES_NIVEAU = {
  emerald: { badge: 'bg-emerald-500', carte: 'border-emerald-200', texte: 'text-emerald-700', halo: 'rgba(16,185,129,0.10)' },
  sky: { badge: 'bg-sky-500', carte: 'border-sky-200', texte: 'text-sky-700', halo: 'rgba(14,165,233,0.10)' },
  violet: { badge: 'bg-violet-500', carte: 'border-violet-200', texte: 'text-violet-700', halo: 'rgba(139,92,246,0.10)' }
} as const

const STYLES_CATEGORIE = {
  CRA: { avatar: 'linear-gradient(135deg, #6366f1, #4f46e5)', etiquette: 'bg-indigo-50 text-indigo-700' },
  IntimAgir: { avatar: 'linear-gradient(135deg, #ec4899, #db2777)', etiquette: 'bg-pink-50 text-pink-700' },
  National: { avatar: 'linear-gradient(135deg, #0ea5e9, #0284c7)', etiquette: 'bg-sky-50 text-sky-700' },
  Autre: { avatar: 'linear-gradient(135deg, #f59e0b, #d97706)', etiquette: 'bg-amber-50 text-amber-700' }
} as const

function initiales(nom: string) {
  const sigle = nom.match(/^([A-ZÉÈÀÎÔÛ]{3,})/)
  if (sigle?.[1]) return sigle[1].substring(0, 4)
  return nom.substring(0, 2).toUpperCase()
}
</script>

<template>
  <div>

    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-20 text-center" style="background: linear-gradient(160deg, #f5f3ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 25% 40%, rgba(139,92,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 75% 60%, rgba(14,165,233,0.08) 0%, transparent 50%)" />
      <div class="relative max-w-4xl mx-auto px-6">
        <div class="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 text-gray-700 text-sm font-medium mb-8">
          <span class="w-2 h-2 rounded-full bg-violet-400 animate-pulse inline-block"></span>
          {{ CENTRES_RESSOURCES.length }} centres ressources référencés
        </div>
        <h1 class="text-5xl sm:text-6xl font-black text-gray-900 mb-5 tracking-tight leading-tight">
          Centres Ressources<br>
          <span style="background: linear-gradient(90deg, #a78bfa 0%, #60a5fa 50%, #4ade80 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Autisme en France</span>
        </h1>
        <p class="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
          Les CRA accompagnent les personnes concernées, leurs proches et les professionnels. Comprenez le parcours de diagnostic et trouvez le centre de votre région.
        </p>
      </div>
    </section>

    <!-- PARCOURS DE DIAGNOSTIC -->
    <section class="bg-white py-16">
      <div class="max-w-5xl mx-auto px-6">

        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">Le parcours de diagnostic</h2>
          <p class="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Depuis la Stratégie nationale pour l'autisme, le repérage et le diagnostic s'organisent en trois niveaux, selon la complexité de la situation.
          </p>
        </div>

        <!-- AVERTISSEMENT -->
        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-12 flex gap-4">
          <span class="text-2xl shrink-0" aria-hidden="true">⚠️</span>
          <div>
            <p class="font-bold text-amber-900 mb-1">On ne consulte pas un CRA de sa propre initiative</p>
            <p class="text-sm text-amber-800 leading-relaxed">
              C'est votre médecin — généraliste, pédiatre ou psychiatre — qui vous oriente vers un CRA s'il souhaite un avis complémentaire. Le diagnostic commence toujours par les premières lignes.
            </p>
          </div>
        </div>

        <!-- LES 3 NIVEAUX -->
        <div class="grid gap-5 md:grid-cols-3 mb-8">
          <div
            v-for="niveau in NIVEAUX"
            :key="niveau.numero"
            class="relative rounded-2xl border-2 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            :class="STYLES_NIVEAU[niveau.couleur].carte"
          >
            <div class="absolute inset-0 rounded-2xl pointer-events-none" :style="`background: radial-gradient(ellipse at 50% 0%, ${STYLES_NIVEAU[niveau.couleur].halo} 0%, transparent 70%)`" />

            <div class="relative">
              <div class="flex items-center gap-3 mb-4">
                <span
                  class="w-10 h-10 rounded-xl text-white font-black text-lg flex items-center justify-center shrink-0"
                  :class="STYLES_NIVEAU[niveau.couleur].badge"
                >{{ niveau.numero }}</span>
                <span class="text-2xl" aria-hidden="true">{{ niveau.emoji }}</span>
              </div>

              <h3 class="font-black text-gray-900 text-lg leading-tight">{{ niveau.titre }}</h3>
              <p class="text-sm font-semibold mb-3" :class="STYLES_NIVEAU[niveau.couleur].texte">{{ niveau.sousTitre }}</p>

              <p class="text-sm text-gray-600 leading-relaxed mb-4">{{ niveau.role }}</p>

              <ul class="space-y-2">
                <li
                  v-for="acteur in niveau.acteurs"
                  :key="acteur"
                  class="text-xs text-gray-600 leading-relaxed pl-4 relative"
                >
                  <span class="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full" :class="STYLES_NIVEAU[niveau.couleur].badge" />
                  {{ acteur }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- EDAP & PCO -->
        <div class="grid gap-5 sm:grid-cols-2">
          <div class="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h3 class="font-black text-gray-900 mb-2 flex items-center gap-2">
              <span class="text-xl" aria-hidden="true">🏥</span> Les EDAP
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Les <strong>Équipes Diagnostic Autisme de Proximité</strong> assurent les évaluations diagnostiques des enfants et adolescents présentant des écarts de développement évoquant un TSA. Elles sont réparties sur le territoire, au plus près des familles.
            </p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h3 class="font-black text-gray-900 mb-2 flex items-center gap-2">
              <span class="text-xl" aria-hidden="true">🧭</span> Les PCO
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Les <strong>Plateformes de Coordination et d'Orientation</strong> s'adressent aux enfants repérés mais qui ne bénéficient pas encore d'un accompagnement, ou dont les droits MDPH ne sont pas ouverts. Elles coordonnent les premiers soutiens.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- LISTE DES CENTRES -->
    <section class="bg-gray-50 py-12">
      <div class="max-w-5xl mx-auto px-6">

        <h2 class="text-2xl font-black text-gray-900 mb-6 tracking-tight">Trouver un centre</h2>

        <!-- RECHERCHE -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
              <input
                v-model="search"
                type="search"
                aria-label="Rechercher un centre par région, ville ou département"
                placeholder="Région, ville, département…"
                class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
              />
            </div>
            <select
              v-model="filtreCategorie"
              aria-label="Filtrer par catégorie de centre"
              class="w-full sm:w-64 px-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
            >
              <option v-for="cat in CATEGORIES" :key="cat.valeur" :value="cat.valeur">{{ cat.label }}</option>
            </select>
          </div>
          <p v-if="filtreCategorie === 'IntimAgir'" class="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-gray-100">
            {{ DESCRIPTION_INTIMAGIR }}
          </p>
        </div>

        <p class="text-sm font-semibold text-gray-600 mb-5 px-1">
          {{ centresFiltres.length }} centre{{ centresFiltres.length > 1 ? 's' : '' }} trouvé{{ centresFiltres.length > 1 ? 's' : '' }}
        </p>

        <div v-if="centresFiltres.length === 0" class="text-center py-16 text-gray-500">
          Aucun centre pour ces critères.
        </div>

        <!-- GROUPES PAR RÉGION -->
        <div v-else class="space-y-10">
          <div v-for="[region, centres] in centresParRegion" :key="region">
            <h3 class="text-sm font-black text-gray-500 uppercase tracking-wider mb-4 px-1">{{ region }}</h3>

            <div class="space-y-4">
              <article
                v-for="centre in centres"
                :key="centre.nom"
                class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
              >
                <div class="flex items-start gap-4">

                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xs shrink-0"
                    :style="`background: ${STYLES_CATEGORIE[centre.categorie].avatar}`"
                  >
                    {{ initiales(centre.nom) }}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <h4 class="font-black text-gray-900 text-lg leading-tight">{{ centre.nom }}</h4>
                      <span
                        v-if="centre.categorie !== 'CRA'"
                        class="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                        :class="STYLES_CATEGORIE[centre.categorie].etiquette"
                      >{{ centre.categorie === 'National' ? 'National' : centre.categorie === 'IntimAgir' ? 'IntimAgir' : 'Spécialisé' }}</span>
                    </div>

                    <!-- Départements couverts -->
                    <div v-if="centre.departements.length" class="flex flex-wrap gap-1.5 mb-3">
                      <span
                        v-for="dept in centre.departements"
                        :key="dept"
                        class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md"
                      >{{ dept }}</span>
                    </div>

                    <p v-if="centre.specialisation" class="text-sm text-gray-600 leading-relaxed mb-3">
                      {{ centre.specialisation }}
                    </p>

                    <p v-if="centre.publicConcerne" class="text-xs text-gray-500 mb-2">
                      <span class="font-semibold">Public :</span> {{ centre.publicConcerne }}
                    </p>

                    <p v-if="centre.adresse" class="text-xs text-gray-500 mb-2">
                      <span class="font-semibold">Adresse :</span>
                      {{ centre.adresse }}<span v-if="centre.ville">, {{ centre.codePostal }} {{ centre.ville }}</span>
                    </p>

                    <p v-if="centre.horaires" class="text-xs text-gray-500 leading-relaxed mb-3">
                      <span class="font-semibold">À savoir :</span> {{ centre.horaires }}
                    </p>

                    <!-- Contacts -->
                    <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      <a v-if="centre.telephone" :href="`tel:${centre.telephone.replace(/\s/g, '')}`" class="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        📞 {{ centre.telephone }}
                      </a>
                      <a v-if="centre.email" :href="`mailto:${centre.email}`" class="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors min-w-0">
                        ✉️ <span class="truncate max-w-[220px]">{{ centre.email }}</span>
                      </a>
                      <a v-if="centre.siteWeb" :href="centre.siteWeb" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
                        🔗 Site web
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-500 text-center mt-10 leading-relaxed">
          Sources : annuaire des ressources Autisme Info Service et Groupement National des Centres Ressources Autisme.<br>
          Une information est inexacte ? <NuxtLink to="/contact" class="text-indigo-500 hover:text-indigo-700 underline">Signalez-le nous</NuxtLink>.
        </p>

      </div>
    </section>

  </div>
</template>
