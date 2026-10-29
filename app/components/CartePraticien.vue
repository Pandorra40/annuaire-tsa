<!--
  Carte d'un praticien dans une liste de résultats.

  Le corps (métier, lieu, badges) ouvre la fiche. Le téléphone est un vrai
  lien tel: hors du NuxtLink — sinon l’apparence « appelable » trompe.
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

const delaiCourt = computed(() => {
  const d = (p.value.delai ?? '').toLowerCase()
  return d.includes('disponible') || d.startsWith('1 ')
})

const abregeMetier = computed(() => p.value.type.slice(0, 3).toUpperCase())

/** href tel: sans espaces (affichage inchangé). */
const telHref = computed(() => {
  const raw = (p.value.telephone ?? '').replace(/[\s.-]/g, '')
  return raw ? `tel:${raw}` : ''
})
</script>

<template>
  <article
    class="flex bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
  >
    <NuxtLink
      :to="`/praticien/${p.id}`"
      class="flex flex-1 min-w-0 text-inherit no-underline"
    >
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
          <span v-if="!p.telephone" class="text-sm text-gray-600">Téléphone non renseigné</span>
          <span v-else class="text-sm text-gray-500 tabular-nums">{{ p.telephone }}</span>
          <span class="flex items-center gap-3">
            <span v-if="p.confirmations > 0" class="text-xs text-emerald-700 font-medium"><span aria-hidden="true">✓</span> {{ p.confirmations }} confirmation{{ p.confirmations > 1 ? 's' : '' }}</span>
            <span class="text-xs text-gray-600">Voir la fiche →</span>
          </span>
        </div>
      </div>
    </NuxtLink>

    <a
      v-if="telHref"
      :href="telHref"
      class="shrink-0 self-stretch flex flex-col items-center justify-center gap-1 px-3 sm:px-4 border-l border-gray-100 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50 text-sm font-semibold tabular-nums min-w-[5.5rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      :aria-label="`Appeler ${p.nom} au ${p.telephone}`"
    >
      <span aria-hidden="true">📞</span>
      <span class="text-xs sm:text-sm text-center leading-tight break-all">{{ p.telephone }}</span>
    </a>
  </article>
</template>
