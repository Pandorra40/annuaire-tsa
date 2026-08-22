<!--
  Carte d'un praticien dans une liste de résultats.

  L'accueil et les pages département affichaient deux cartes presque
  identiques mais divergentes : l'une montrait le délai, le badge « Nouveau »
  et un bouton département, l'autre plaçait les confirmations ailleurs et
  omettait le reste. Même objet, deux rendus, deux fois le code à maintenir —
  et une famille qui ne voyait pas la même chose selon son chemin d'arrivée.

  Ce qui figure sur la carte répond aux questions qu'on se pose avant de
  cliquer : est-ce le bon métier, le bon public, le bon endroit, sous quel
  délai, et surtout — fait-il des bilans, ou seulement du suivi. Cette
  dernière est la bifurcation la plus décisive du parcours d'une famille, elle
  mérite sa place ici plutôt qu'au fond d'une fiche.

  Le tarif, lui, n'y figure PAS, alors qu'il en avait l'air un bon candidat.
  Mesuré sur les 320 fiches publiées, il fait 60 caractères de médiane et
  jusqu'à 711 : deux tiers dépassent 40 caractères, et une pastille les
  déforme. Il ne se résume pas davantage, parce qu'un praticien annonce
  couramment plusieurs prix pour plusieurs actes — « évaluations entre 450 et
  550 euros, consultations de suivi 60 euros ». N'en montrer qu'un tromperait
  dans un sens ou dans l'autre. Il reste sur la fiche, où il a la place et son
  contexte.

  Rien n'est affiché sur ce qu'on ignore : une fiche sans information de
  bilans n'affiche pas « non ».
-->
<script setup lang="ts">
import type { Praticien } from '~/types/index'
import { couleurMetier, isNew } from '~/composables/usePraticien'

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

// Sur les pages département, toutes les cartes partagent déjà ce département :
// l'onglet montre alors le métier plutôt que de répéter un numéro déjà connu.
const abregeMetier = computed(() => p.value.type.slice(0, 3).toUpperCase())
</script>

<template>
  <NuxtLink
    :to="`/praticien/${p.id}`"
    class="flex bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
  >
    <!-- Onglet coloré par métier — remplace l'ancienne pastille d'initiales,
         identique sur les 320 fiches et n'apprenant rien. Le métier reste
         écrit en toutes lettres dans le sous-titre : la couleur double
         l'information, elle ne la porte jamais seule. -->
    <div
      class="w-14 sm:w-[4.5rem] shrink-0 flex flex-col items-center justify-center gap-0.5 text-white py-4 px-1"
      :style="{ background: couleurMetier(p.type) }"
    >
      <span v-if="!masquerDepartement" class="font-black text-xl sm:text-2xl tabular-nums leading-none">{{ p.departement }}</span>
      <span v-if="!masquerDepartement" class="text-[0.6rem] font-bold uppercase tracking-wider opacity-85">Dép.</span>
      <span v-else class="font-black text-base sm:text-lg tracking-tight leading-none">{{ abregeMetier }}</span>
    </div>

    <div class="flex-1 min-w-0 p-4 sm:p-5">
      <div class="flex items-center gap-2 flex-wrap mb-1">
        <span class="font-black text-gray-900 text-lg">{{ p.nom }}</span>
        <span v-if="isNew(p.created_at)" class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">● Nouveau</span>
      </div>

      <p class="text-gray-700 text-sm mb-3">
        <span class="font-semibold" :style="{ color: couleurMetier(p.type) }">{{ p.type }}</span> · {{ lieux }}
      </p>

      <div class="flex flex-wrap gap-1.5">
        <span v-for="age in p.ages" :key="age" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{{ age }}</span>
        <span v-if="p.fait_bilans === 1" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">Réalise des bilans</span>
        <span v-if="p.teleconsultation" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Téléconsultation</span>
        <span v-if="p.delai" class="px-2.5 py-1 text-xs font-medium rounded-full" :class="delaiCourt ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">Délai : {{ p.delai }}</span>
      </div>

      <div class="border-t border-gray-100 mt-4 pt-3.5 flex items-center justify-between gap-3 flex-wrap">
        <span v-if="p.telephone" class="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 tabular-nums">
          <span aria-hidden="true">📞</span> {{ p.telephone }}
        </span>
        <span v-else class="text-sm text-gray-600">Téléphone non renseigné</span>

        <span class="flex items-center gap-3">
          <span v-if="p.confirmations > 0" class="text-xs text-emerald-700 font-medium"><span aria-hidden="true">✓</span> {{ p.confirmations }} confirmation{{ p.confirmations > 1 ? 's' : '' }}</span>
          <span class="text-xs text-gray-600">Voir la fiche →</span>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
