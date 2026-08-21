<script setup lang="ts">
import type { Praticien } from '~/types/index'

const route = useRoute()
const num = route.params.num as string
const { fetchPraticiensDepartement } = useApi()

const nomDept = computed(() => nomDepartement(num))

useSeoMeta({
  title: computed(() => `Praticiens TSA — Département ${num} (${nomDept.value})`),
  description: computed(() => `Trouvez un praticien spécialisé TSA dans le département ${num} — ${nomDept.value}. Psychiatres, psychologues, orthophonistes, ergothérapeutes.`)
})

// Rendu au build pour que les moteurs voient la liste (SEO) et qu'elle
// s'affiche immédiatement.
const { data: tous, status } = await useAsyncData(`praticiens-dep-${num}`, () => fetchPraticiensDepartement(num))

// La page est prérendue : `refresh()` ne remplace pas son contenu. Il faut
// relire l'API au montage et servir cette version-là, sinon les corrections
// faites dans l'admin n'apparaissent qu'après avoir régénéré tout le site.
const fraiche = ref<Praticien[] | null>(null)

onMounted(async () => {
  try {
    const reponse = await fetchPraticiensDepartement(num)
    if (reponse) fraiche.value = reponse
  } catch {
    // Réseau indisponible : on garde la liste du prérendu, déjà affichée.
  }
})

// Le filtre reste appliqué côté client : si l'API ne gère pas encore le
// paramètre departement, elle renvoie tout et la page affiche quand même
// les bons praticiens. Matche aussi departement2 : un praticien à deux lieux
// (ex. Institut Mentis Portae, Paris et Étampes) doit apparaître dans les
// deux départements, pas seulement le premier.
const praticiens = computed<Praticien[]>(() =>
  (fraiche.value ?? tous.value ?? []).filter((p: Praticien) =>
    p.departement === num.toUpperCase() || p.departement === num
    || p.departement2 === num.toUpperCase() || p.departement2 === num
  )
)

// Mêmes filtres que sur l'accueil. Cette page était la seule liste du site
// sans aucun moyen de se réduire, alors qu'on y atterrit depuis une fiche.
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

// Départements limitrophes, pour qu'un département vide cesse d'être un
// cul-de-sac. Vingt kilomètres pèsent plus qu'une frontière administrative
// quand on cherche un rendez-vous — et la liste est celle des voisins réels,
// pas des numéros voisins : le 01 ne touche pas le 02.
const LIMITROPHES: Record<string, string[]> = {
  '01': ['39', '71', '69', '38', '73', '74'], '02': ['59', '60', '77', '51', '08', '80'],
  '03': ['18', '58', '71', '42', '63', '23'], '04': ['05', '26', '84', '83', '06'],
  '05': ['38', '73', '26', '04'], '06': ['04', '83'],
  '07': ['26', '38', '42', '43', '48', '30', '84'], '08': ['02', '51', '55'],
  '09': ['31', '11', '66'], '10': ['77', '51', '52', '21', '89'],
  '11': ['09', '31', '81', '34', '66'], '12': ['46', '15', '48', '30', '34', '81', '82'],
  '13': ['84', '83', '30'], '14': ['50', '61', '27', '76'],
  '15': ['19', '63', '43', '48', '12', '46'], '16': ['79', '86', '87', '24', '17'],
  '17': ['85', '79', '16', '24', '33'], '18': ['41', '45', '58', '03', '23', '36'],
  '19': ['23', '87', '24', '46', '15', '63'], '21': ['89', '10', '52', '70', '39', '71', '58'],
  '22': ['29', '56', '35'], '23': ['18', '36', '87', '19', '63', '03'],
  '24': ['16', '87', '19', '46', '47', '33'], '25': ['70', '39', '90'],
  '26': ['38', '05', '84', '30', '07'], '27': ['76', '60', '95', '78', '28', '61', '14'],
  '28': ['27', '78', '91', '45', '41', '72', '61'], '29': ['22', '56'],
  '2A': ['2B'], '2B': ['2A'],
  '30': ['07', '48', '12', '34', '13', '84'], '31': ['65', '32', '82', '81', '11', '09'],
  '32': ['40', '47', '82', '31', '65', '64'], '33': ['17', '24', '47', '40'],
  '34': ['12', '30', '11', '81'], '35': ['22', '56', '44', '49', '53', '50'],
  '36': ['37', '41', '18', '23', '87', '86'], '37': ['72', '41', '36', '86', '49'],
  '38': ['01', '73', '05', '26', '07', '42', '69'], '39': ['25', '70', '21', '71', '01'],
  '40': ['33', '47', '32', '64'], '41': ['28', '45', '18', '36', '37', '72'],
  '42': ['71', '03', '63', '43', '07', '38', '69'], '43': ['63', '42', '07', '48', '15'],
  '44': ['35', '56', '49', '85'], '45': ['77', '89', '58', '18', '41', '28', '91'],
  '46': ['24', '19', '15', '12', '82', '47'], '47': ['33', '24', '46', '82', '32', '40'],
  '48': ['43', '07', '30', '34', '12', '15'], '49': ['44', '35', '53', '72', '37', '86', '79', '85'],
  '50': ['14', '61', '35'], '51': ['02', '08', '55', '52', '10', '77'],
  '52': ['51', '55', '88', '70', '21', '10'], '53': ['35', '50', '61', '72', '49'],
  '54': ['55', '57', '88'], '55': ['08', '51', '52', '88', '54'],
  '56': ['29', '22', '35', '44'], '57': ['54', '67', '88'],
  '58': ['45', '89', '21', '71', '03', '18'], '59': ['62', '02'],
  '60': ['80', '02', '77', '95', '27', '76'], '61': ['50', '14', '27', '28', '72', '53'],
  '62': ['59', '80'], '63': ['03', '42', '43', '15', '19', '23'],
  '64': ['40', '32', '65'], '65': ['64', '32', '31'],
  '66': ['09', '11'], '67': ['57', '88', '68'], '68': ['67', '88', '90'],
  '69': ['01', '38', '42', '71'], '70': ['52', '88', '90', '25', '39', '21'],
  '71': ['21', '39', '01', '69', '42', '03', '58'], '72': ['61', '28', '41', '37', '49', '53'],
  '73': ['74', '01', '38', '05'], '74': ['01', '73'],
  '75': ['92', '93', '94'], '76': ['80', '60', '27', '14'],
  '77': ['02', '51', '10', '89', '45', '91', '94', '93', '95', '60'],
  '78': ['95', '92', '91', '28', '27'], '79': ['85', '49', '86', '16', '17'],
  '80': ['62', '02', '60', '76'], '81': ['12', '34', '11', '31', '82'],
  '82': ['46', '12', '81', '31', '32', '47'], '83': ['13', '84', '04', '06'],
  '84': ['26', '04', '83', '13', '30'], '85': ['44', '49', '79', '17'],
  '86': ['49', '37', '36', '87', '16', '79'], '87': ['86', '36', '23', '19', '24', '16'],
  '88': ['52', '55', '54', '57', '67', '68', '90', '70'], '89': ['77', '10', '21', '58', '45'],
  '90': ['70', '88', '68', '25'], '91': ['78', '92', '94', '77', '45', '28'],
  '92': ['95', '78', '91', '94', '75', '93'], '93': ['95', '77', '94', '75', '92'],
  '94': ['93', '77', '91', '92', '75'], '95': ['60', '77', '93', '92', '78', '27']
}

const voisins = computed(() =>
  (LIMITROPHES[num.toUpperCase()] ?? [])
    .map(n => ({ num: n, nom: DEPARTEMENTS[n] ?? n }))
)
</script>

<template>
  <div>

    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-14" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.07) 0%, transparent 50%)" />

      <div class="relative max-w-3xl mx-auto px-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Retour à l'annuaire
        </NuxtLink>
        <div class="flex items-center gap-4 mb-2">
          <div class="text-5xl font-black" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">{{ num }}</div>
          <h1 class="text-3xl font-black text-gray-900">{{ nomDept }}</h1>
        </div>
        <p class="text-gray-500 text-lg">Praticiens spécialisés TSA dans ce département</p>
      </div>
    </section>

    <!-- RÉSULTATS -->
    <section class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-6">

        <div v-if="status === 'pending' && !tous" class="flex justify-center py-16">
          <svg class="animate-spin text-gray-400 w-10 h-10" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
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
            :placeholder="`Un nom, une ville du ${num}…`"
            class="mb-6"
          />

          <p class="text-sm font-semibold text-gray-500 mb-4 px-2">
            {{ praticiensFiltres.length }} praticien{{ praticiensFiltres.length > 1 ? 's' : '' }} trouvé{{ praticiensFiltres.length > 1 ? 's' : '' }}
            <span v-if="praticiensFiltres.length !== praticiens.length" class="font-normal text-gray-400">
              sur {{ praticiens.length }} dans le département
            </span>
          </p>

          <div v-if="praticiensFiltres.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p class="text-gray-600 mb-2 font-medium">
              {{ praticiens.length ? 'Aucun praticien ne correspond à ces critères.' : 'Aucun praticien référencé dans ce département pour le moment.' }}
            </p>
            <p v-if="voisins.length" class="text-sm text-gray-500 mb-4">Essayez un département limitrophe :</p>
            <div v-if="voisins.length" class="flex flex-wrap gap-2 justify-center px-6 mb-6">
              <NuxtLink
                v-for="v in voisins"
                :key="v.num"
                :to="`/departement/${v.num}`"
                class="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-sm font-semibold hover:bg-indigo-100 transition-colors"
              >{{ v.nom }} ({{ v.num }})</NuxtLink>
            </div>
            <NuxtLink to="/suggerer" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
              Suggérer un praticien →
            </NuxtLink>
          </div>

          <div v-else class="space-y-3">
            <CartePraticien v-for="p in praticiensFiltres" :key="p.id" :praticien="p" masquer-departement />
          </div>

          <!-- Affichés même quand la liste est pleine : chercher plus loin est
               souvent le bon réflexe, pas seulement un dernier recours. -->
          <div v-if="praticiensFiltres.length && voisins.length" class="mt-10 pt-6 border-t border-gray-200">
            <p class="text-sm font-semibold text-gray-500 mb-3">Départements limitrophes</p>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="v in voisins"
                :key="v.num"
                :to="`/departement/${v.num}`"
                class="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm hover:border-gray-400 transition-colors"
              >{{ v.nom }} <span class="tabular-nums text-gray-400">{{ v.num }}</span></NuxtLink>
            </div>
          </div>

        </template>
      </div>
    </section>

  </div>
</template>
