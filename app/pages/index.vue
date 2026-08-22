<script setup lang="ts">
import type { Praticien } from '~/types/index'

useSeoMeta({
  title: 'Annuaire TSA / Autisme — Trouvez un spécialiste près de chez vous',
  description: 'Annuaire collaboratif et gratuit de praticiens spécialisés en autisme et TSA (troubles du spectre autistique) en France.'
})

const { fetchPraticiens } = useApi()

// Chargé à la génération du site, et non plus `server: false` : sans données au
// build, la page d'accueil était publiée vide — aucun praticien dans le HTML,
// donc rien pour les moteurs de recherche, et un « Chargement… » à chaque
// visite. C'est le motif déjà en place sur departement/[num].vue.
const { data: prerendus, status } = await useAsyncData('praticiens', fetchPraticiens)

// La page étant prérendue, son contenu est figé au build : il faut relire
// l'API au montage et servir cette version-là, sinon une fiche corrigée depuis
// l'admin n'apparaît qu'après avoir régénéré tout le site.
const fraiche = ref<Praticien[] | null>(null)

onMounted(async () => {
  try {
    const reponse = await fetchPraticiens()
    if (reponse) fraiche.value = reponse
  } catch {
    // Réseau indisponible : on garde la liste du prérendu, déjà affichée.
  }
})

const praticiens = computed<Praticien[]>(() => fraiche.value ?? prerendus.value ?? [])

// L'erreur ne s'affiche que si rien n'a pu être chargé, ni au build ni depuis
// le navigateur : un échec au build seul ne doit pas figer un message d'erreur
// dans une page qui se remplira très bien côté client.
const enErreur = computed(() => status.value === 'error' && !praticiens.value.length)
const enChargement = computed(() =>
  (status.value === 'pending' || status.value === 'idle') && !praticiens.value.length
)

const route = useRoute()
const router = useRouter()

// État initialisé depuis l'URL (restauré au retour navigateur, partageable par lien)
const search = ref((route.query.q as string) || '')
const filtreType = ref((route.query.type as string) || 'tous')
const filtreAge = ref((route.query.age as string) || 'tous')
const filtreTele = ref((route.query.tele as string) || 'tous')
const filtreBilans = ref((route.query.bilans as string) || 'tous')

const howItWorks = [
  { titre: 'Trouver un spécialiste', desc: 'Recherchez par ville, département ou spécialité. Filtrez selon vos besoins.', emoji: '🔍', bg: 'bg-indigo-50 border-indigo-100', iconBg: 'bg-indigo-100' },
  { titre: 'Suggérer un praticien', desc: 'Vous connaissez un spécialiste qui n\'apparaît pas ? Ajoutez-le en quelques clics.', emoji: '➕', bg: 'bg-emerald-50 border-emerald-100', iconBg: 'bg-emerald-100' },
  { titre: 'Veiller à la qualité', desc: 'Confirmez ou signalez les fiches pour aider la communauté.', emoji: '🛡️', bg: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100' }
]

const specialites = [
  { nom: 'Psychiatre', emoji: '🧠' },
  { nom: 'Psychologue', emoji: '💬' },
  { nom: 'Orthophoniste', emoji: '🗣️' },
  { nom: 'Ergothérapeute', emoji: '🤲' }
]

const PAGE_SIZE = 20
const page = ref(Number(route.query.page) || 1)

// Le filtrage vit dans FiltresPraticiens, qui l'expose : les compteurs de
// chaque pastille s'en servent déjà, et le dupliquer ici les ferait diverger.
const filtres = ref<{ passe: (p: Praticien) => boolean } | null>(null)

const praticiensFiltres = computed(() => {
  const test = filtres.value?.passe
  if (!test) return praticiens.value
  return praticiens.value.filter(test)
})

const totalPages = computed(() => Math.ceil(praticiensFiltres.value.length / PAGE_SIZE))
// Borne la page si l'URL restaurée dépasse le nombre de pages disponibles
const pageActuelle = computed(() => Math.min(Math.max(page.value, 1), Math.max(totalPages.value, 1)))
const praticiensPagines = computed(() => praticiensFiltres.value.slice((pageActuelle.value - 1) * PAGE_SIZE, pageActuelle.value * PAGE_SIZE))

// Un changement de filtre revient à la page 1
watch([search, filtreType, filtreAge, filtreTele, filtreBilans], () => {
  page.value = 1
})

// Reflète l'état (page + filtres) dans l'URL pour le restaurer au retour navigateur
watch([search, filtreType, filtreAge, filtreTele, filtreBilans, page], () => {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.q = search.value.trim()
  if (filtreType.value !== 'tous') query.type = filtreType.value
  if (filtreAge.value !== 'tous') query.age = filtreAge.value
  if (filtreTele.value !== 'tous') query.tele = filtreTele.value
  if (filtreBilans.value !== 'tous') query.bilans = filtreBilans.value
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
    <section class="relative overflow-hidden py-16 text-center" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 15% 50%, rgba(239,68,68,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 30%, rgba(99,102,241,0.07) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(74,222,128,0.05) 0%, transparent 50%)" />
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />

      <div class="relative max-w-5xl mx-auto px-6">
        <div class="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 text-gray-700 text-sm font-medium mb-10">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
          Annuaire collaboratif · Gratuit · Sans inscription
        </div>

        <!-- clamp() + text-wrap: balance plutôt que des <br> figés à text-7xl :
             en mode texte agrandi (A+), le titre occupait presque tout
             l'écran et coupait mal. Il reste grand, il s'adapte simplement. -->
        <h1 class="font-black leading-tight mb-6 tracking-tight text-gray-900 mx-auto" style="font-size: clamp(2.5rem, 5.5vw, 4.5rem); text-wrap: balance; max-width: 18ch">
          Trouvez un
          <span style="background: linear-gradient(90deg, #f87171 0%, #fb923c 20%, #fbbf24 40%, #4ade80 60%, #60a5fa 80%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">spécialiste en autisme</span>
          près de chez vous
        </h1>

        <p class="text-gray-700 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Psychiatres, psychologues, neuropsychologues, orthophonistes,<br class="hidden sm:block" /> ergothérapeutes et psychomotriciens spécialisés en autisme et TSA.
        </p>

        <!-- La recherche vit DANS le hero : c'est elle le contenu principal.
             Le bouton « Rechercher » qui redescendait la page disparaît, il
             n'avait de sens que tant que l'annuaire était plus bas. Le panneau
             reprend l'alignement à gauche — un formulaire centré se lit mal. -->
        <div class="max-w-5xl mx-auto text-left">
          <FiltresPraticiens
            ref="filtres"
            v-model:recherche="search"
            v-model:type="filtreType"
            v-model:age="filtreAge"
            v-model:tele="filtreTele"
            v-model:bilans="filtreBilans"
            :praticiens="praticiens"
          />
        </div>
      </div>
    </section>

    <!-- RÉSULTATS -->
    <section id="annuaire" class="bg-gray-50 py-10">
      <div class="max-w-5xl mx-auto px-6">

        <!-- États -->
        <div v-if="enChargement" class="text-center py-16 text-gray-500 text-sm">
          Chargement de l'annuaire…
        </div>

        <div v-else-if="enErreur" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          Impossible de charger les praticiens. Réessayez dans quelques instants.
        </div>

        <template v-else>
          <!-- role="status" aria-live="polite" : un changement de filtre modifiait
               la liste sans jamais l'annoncer à un lecteur d'écran. -->
          <p class="text-sm font-semibold text-gray-500 mb-4 px-2" role="status" aria-live="polite">
            {{ praticiensFiltres.length }} praticien{{ praticiensFiltres.length > 1 ? 's' : '' }} trouvé{{ praticiensFiltres.length > 1 ? 's' : '' }}
            <span v-if="totalPages > 1"> — page {{ pageActuelle }} / {{ totalPages }}</span>
          </p>

          <div v-if="praticiensFiltres.length === 0" class="text-center py-16 text-gray-500">
            Aucun résultat pour ces critères.
          </div>

          <div v-else class="space-y-3">
            <CartePraticien v-for="p in praticiensPagines" :key="p.id" :praticien="p" />
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
          <p class="text-indigo-200 text-lg leading-relaxed mb-8">Aidez la communauté. Nom, ville et spécialité suffisent, c'est rapide et gratuit.</p>
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
