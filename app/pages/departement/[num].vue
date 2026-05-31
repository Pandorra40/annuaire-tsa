<script setup lang="ts">
import type { Praticien } from '~/types/index'
import { initiales } from '~/composables/usePraticien'

const route = useRoute()
const num = route.params.num as string
const { fetchPraticiens } = useApi()

const DEPARTEMENTS: Record<string, string> = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence', '05': 'Hautes-Alpes',
  '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes', '09': 'Ariège', '10': 'Aube',
  '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal',
  '16': 'Charente', '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or',
  '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme',
  '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
  '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault',
  '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique',
  '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
  '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
  '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques',
  '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône',
  '70': 'Haute-Saône', '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines', '79': 'Deux-Sèvres',
  '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne', '83': 'Var', '84': 'Vaucluse',
  '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne',
  '90': 'Territoire de Belfort', '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': 'Val-d\'Oise', '971': 'Guadeloupe', '972': 'Martinique',
  '973': 'Guyane', '974': 'La Réunion', '976': 'Mayotte'
}

const nomDepartement = computed(() => DEPARTEMENTS[num.toUpperCase()] ?? `Département ${num}`)

useSeoMeta({
  title: computed(() => `Praticiens TSA — Département ${num} (${nomDepartement.value})`),
  description: computed(() => `Trouvez un praticien spécialisé TSA dans le département ${num} — ${nomDepartement.value}. Psychiatres, psychologues, orthophonistes, ergothérapeutes.`)
})

const { data: tous, status } = await useAsyncData(`praticiens-dep-${num}`, fetchPraticiens, { server: false })

const praticiens = computed<Praticien[]>(() =>
  (tous.value ?? []).filter((p: Praticien) => p.departement === num.toUpperCase() || p.departement === num)
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
          <h1 class="text-3xl font-black text-gray-900">{{ nomDepartement }}</h1>
        </div>
        <p class="text-gray-500 text-lg">Praticiens spécialisés TSA dans ce département</p>
      </div>
    </section>

    <!-- RÉSULTATS -->
    <section class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-6">

        <div v-if="status === 'pending'" class="flex justify-center py-16">
          <svg class="animate-spin text-gray-400 w-10 h-10" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>

        <template v-else>
          <p class="text-sm font-semibold text-gray-500 mb-4 px-2">
            {{ praticiens.length }} praticien{{ praticiens.length > 1 ? 's' : '' }} trouvé{{ praticiens.length > 1 ? 's' : '' }}
          </p>

          <div v-if="praticiens.length === 0" class="text-center py-16">
            <div class="text-gray-400 mb-4">Aucun praticien référencé dans ce département pour le moment.</div>
            <NuxtLink to="/suggerer" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
              Suggérer un praticien →
            </NuxtLink>
          </div>

          <div v-else class="space-y-3">
            <NuxtLink
              v-for="p in praticiens"
              :key="p.id"
              :to="`/praticien/${p.id}`"
              class="block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 p-6"
            >
              <div class="flex items-start gap-5">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-base shrink-0" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
                  {{ initiales(p.nom) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-black text-gray-900 text-lg mb-1">{{ p.nom }}</div>
                  <p class="text-gray-500 text-sm mb-3">{{ p.type }} · {{ p.ville }}</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="age in p.ages" :key="age" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{{ age }}</span>
                    <span v-if="p.teleconsultation" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Téléconsultation</span>
                  </div>
                </div>
              </div>
              <div class="border-t border-gray-100 mt-5 pt-4 flex items-center justify-between">
                <span v-if="p.telephone" class="text-sm font-semibold text-indigo-600 flex items-center gap-1.5">
                  📞 {{ p.telephone }}
                </span>
                <span v-else class="text-sm text-gray-400">Téléphone non renseigné</span>
                <span v-if="p.confirmations > 0" class="text-xs text-emerald-600 font-medium">✓ {{ p.confirmations }} confirmation{{ p.confirmations > 1 ? 's' : '' }}</span>
              </div>
            </NuxtLink>
          </div>
        </template>
      </div>
    </section>

  </div>
</template>
