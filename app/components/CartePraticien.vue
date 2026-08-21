<!--
  Carte d'un praticien dans une liste de résultats.

  L'accueil et les pages département affichaient deux cartes presque
  identiques mais divergentes : l'une montrait le délai, le badge « Nouveau »
  et un bouton département, l'autre plaçait les confirmations ailleurs et
  omettait le reste. Même objet, deux rendus, deux fois le code à maintenir —
  et une famille qui ne voyait pas la même chose selon son chemin d'arrivée.

  Ce qui figure sur la carte répond aux questions qu'on se pose avant de
  cliquer : est-ce le bon métier, le bon public, le bon endroit, à quel prix,
  sous quel délai, et surtout — fait-il des bilans, ou seulement du suivi.
  Cette dernière est la bifurcation la plus décisive du parcours d'une
  famille, elle mérite sa place ici plutôt qu'au fond d'une fiche.

  Rien n'est affiché sur ce qu'on ignore : une fiche sans information de
  bilans n'affiche pas « non ».
-->
<script setup lang="ts">
import type { Praticien } from '~/types/index'
import { initiales, isNew } from '~/composables/usePraticien'

const props = defineProps<{
  praticien: Praticien
  /** Masque le lien département sur les pages qui en sont déjà une. */
  masquerDepartement?: boolean
}>()

const p = computed(() => props.praticien)

const lieux = computed(() => {
  const premier = `${p.value.ville} (${p.value.departement})`
  if (!p.value.ville2) return premier
  return `${premier} et ${p.value.ville2}${p.value.departement2 ? ` (${p.value.departement2})` : ''}`
})

// Un délai court se lit en vert, un délai long en ambre. « Disponible » et
// « 1 mois » sont les seules valeurs qui rassurent vraiment.
const delaiCourt = computed(() => {
  const d = (p.value.delai ?? '').toLowerCase()
  return d.includes('disponible') || d.startsWith('1 ')
})
</script>

<template>
  <NuxtLink
    :to="`/praticien/${p.id}`"
    class="block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 p-5 sm:p-6"
  >
    <div class="flex items-start gap-4 sm:gap-5">
      <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-white text-sm sm:text-base shrink-0" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
        {{ initiales(p.nom) }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <span class="font-black text-gray-900 text-lg">{{ p.nom }}</span>
          <span v-if="isNew(p.created_at)" class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">● Nouveau</span>
        </div>

        <p class="text-gray-700 text-sm mb-3">{{ p.type }} · {{ lieux }}</p>

        <div class="flex flex-wrap gap-1.5">
          <span v-for="age in p.ages" :key="age" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{{ age }}</span>
          <span v-if="p.fait_bilans === 1" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">Réalise des bilans</span>
          <span v-if="p.teleconsultation" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Téléconsultation</span>
          <span v-if="p.tarifs" class="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full tabular-nums">{{ p.tarifs }}</span>
          <span v-if="p.delai" class="px-2.5 py-1 text-xs font-medium rounded-full" :class="delaiCourt ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">Délai : {{ p.delai }}</span>
        </div>
      </div>

      <div v-if="!masquerDepartement" class="hidden sm:flex flex-col items-end gap-2 shrink-0">
        <button type="button" class="text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors" @click.prevent.stop="navigateTo(`/departement/${p.departement}`)">
          Dép. {{ p.departement }}
        </button>
      </div>
    </div>

    <div class="border-t border-gray-100 mt-4 pt-3.5 flex items-center justify-between gap-3 flex-wrap">
      <span v-if="p.telephone" class="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 tabular-nums">
        📞 {{ p.telephone }}
      </span>
      <span v-else class="text-sm text-gray-600">Téléphone non renseigné</span>

      <span class="flex items-center gap-3">
        <span v-if="p.confirmations > 0" class="text-xs text-emerald-700 font-medium">✓ {{ p.confirmations }} confirmation{{ p.confirmations > 1 ? 's' : '' }}</span>
        <span class="text-xs text-gray-600">Voir la fiche →</span>
      </span>
    </div>
  </NuxtLink>
</template>
