<!--
  Panneau de recherche et de filtres, partagé par l'accueil et les pages
  département.

  Trois choses le distinguent de ce qui existait :

  1. Chaque groupe porte son intitulé. Les trois rangées de pastilles empilées
     ne disaient pas ce qu'elles triaient — métier, âge, modalité — et
     l'implicite est précisément ce qu'il faut éviter pour un public qui
     inclut des personnes autistes.

  2. Chaque pastille affiche le nombre de fiches qu'elle donnera, et celle qui
     n'en donnerait aucune est désactivée plutôt que de mener à une page vide.
     Le compte est calculé en ignorant la facette à laquelle la pastille
     appartient, sinon toutes les autres tomberaient à zéro dès qu'un choix
     est fait.

  3. Les filtres actifs se retirent un par un, dans une ligne dédiée.

  « Réalise des bilans » a été retenu comme filtre et le tarif écarté, selon
  un test simple : une mauvaise réponse à cette question fait-elle perdre des
  semaines à quelqu'un ? Le tarif reste affiché sur chaque carte — informer
  n'est pas classer, et le site avertit lui-même que les tarifs peuvent avoir
  changé.
-->
<script setup lang="ts">
import type { Praticien } from '~/types/index'
import { TYPES_PRATICIENS, AGES_OPTIONS } from '~/types/index'

const props = defineProps<{
  /** L'ensemble sur lequel porte la recherche, avant filtrage. */
  praticiens: Praticien[]
  /** Placeholder du champ de recherche, propre au contexte. */
  placeholder?: string
}>()

const recherche = defineModel<string>('recherche', { required: true })
const type = defineModel<string>('type', { required: true })
const age = defineModel<string>('age', { required: true })
const tele = defineModel<string>('tele', { required: true })
const bilans = defineModel<string>('bilans', { required: true })

/**
 * Un praticien passe-t-il les filtres ? `sauf` permet d'ignorer une facette,
 * pour calculer ce que donnerait chacune de ses pastilles.
 */
function passe(p: Praticien, sauf?: 'type' | 'age' | 'tele' | 'bilans') {
  const q = normaliserRecherche(recherche.value).trim()
  const matchQ = !q
    || normaliserRecherche(p.ville).includes(q)
    || p.departement.includes(q)
    || normaliserRecherche(p.nom).includes(q)
    || normaliserRecherche(p.ville2 ?? '').includes(q)
    || (p.departement2 ?? '').includes(q)
  if (!matchQ) return false
  if (sauf !== 'type' && type.value !== 'tous' && p.type !== type.value) return false
  if (sauf !== 'age' && age.value !== 'tous' && !p.ages.includes(age.value)) return false
  if (sauf !== 'tele' && tele.value === 'oui' && !p.teleconsultation) return false
  if (sauf !== 'bilans' && bilans.value === 'oui' && p.fait_bilans !== 1) return false
  return true
}

defineExpose({ passe })

function compte(sauf: 'type' | 'age' | 'tele' | 'bilans', predicat: (p: Praticien) => boolean) {
  return props.praticiens.filter(p => passe(p, sauf) && predicat(p)).length
}

const comptesType = computed(() => {
  const total = props.praticiens.filter(p => passe(p, 'type')).length
  const parType = Object.fromEntries(
    TYPES_PRATICIENS.map(t => [t, compte('type', p => p.type === t)])
  )
  return { total, parType }
})

const comptesAge = computed(() => ({
  total: props.praticiens.filter(p => passe(p, 'age')).length,
  parAge: Object.fromEntries(AGES_OPTIONS.map(a => [a, compte('age', p => p.ages.includes(a))]))
}))

const compteTele = computed(() => compte('tele', p => !!p.teleconsultation))
const compteBilans = computed(() => compte('bilans', p => p.fait_bilans === 1))

const filtresActifs = computed(() => {
  const actifs: Array<{ libelle: string, retirer: () => void }> = []
  if (recherche.value.trim()) actifs.push({ libelle: `« ${recherche.value.trim()} »`, retirer: () => recherche.value = '' })
  if (type.value !== 'tous') actifs.push({ libelle: type.value, retirer: () => type.value = 'tous' })
  if (age.value !== 'tous') actifs.push({ libelle: age.value, retirer: () => age.value = 'tous' })
  if (tele.value === 'oui') actifs.push({ libelle: 'Téléconsultation', retirer: () => tele.value = 'tous' })
  if (bilans.value === 'oui') actifs.push({ libelle: 'Réalise des bilans', retirer: () => bilans.value = 'tous' })
  return actifs
})

function toutEffacer() {
  recherche.value = ''
  type.value = 'tous'
  age.value = 'tous'
  tele.value = 'tous'
  bilans.value = 'tous'
}

const CLASSE_PASTILLE = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
const CLASSE_ACTIVE = 'bg-gray-900 text-white border-gray-900'
const CLASSE_INACTIVE = 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
    <div class="relative mb-5">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" aria-hidden="true">🔍</span>
      <input
        v-model="recherche"
        type="search"
        aria-label="Rechercher un praticien par ville, département ou nom"
        :placeholder="placeholder ?? 'Bordeaux, 33, Dr Dupont…'"
        aria-describedby="portee-recherche"
        class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
      >
      <!-- Une barre de recherche qui ne dit pas son périmètre laisse croire
           qu'elle cherche partout. -->
      <p id="portee-recherche" class="text-xs text-gray-500 mt-2">
        Cherche dans le nom, la ville et le département — <strong>y compris le second lieu</strong> quand un praticien en a deux.
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <span class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Métier</span>
        <div class="flex flex-wrap gap-2">
          <button type="button" :class="[CLASSE_PASTILLE, type === 'tous' ? CLASSE_ACTIVE : CLASSE_INACTIVE]" :aria-pressed="type === 'tous'" @click="type = 'tous'">
            Tous <span class="tabular-nums opacity-60">{{ comptesType.total }}</span>
          </button>
          <button
            v-for="t in TYPES_PRATICIENS"
            :key="t"
            type="button"
            :class="[CLASSE_PASTILLE, type === t ? CLASSE_ACTIVE : CLASSE_INACTIVE]"
            :aria-pressed="type === t"
            :disabled="comptesType.parType[t] === 0 && type !== t"
            @click="type = type === t ? 'tous' : t"
          >
            {{ t }} <span class="tabular-nums opacity-60">{{ comptesType.parType[t] }}</span>
          </button>
        </div>
      </div>

      <div>
        <span class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Public reçu</span>
        <div class="flex flex-wrap gap-2">
          <button type="button" :class="[CLASSE_PASTILLE, age === 'tous' ? CLASSE_ACTIVE : CLASSE_INACTIVE]" :aria-pressed="age === 'tous'" @click="age = 'tous'">
            Tous âges <span class="tabular-nums opacity-60">{{ comptesAge.total }}</span>
          </button>
          <button
            v-for="a in AGES_OPTIONS"
            :key="a"
            type="button"
            :class="[CLASSE_PASTILLE, age === a ? CLASSE_ACTIVE : CLASSE_INACTIVE]"
            :aria-pressed="age === a"
            :disabled="comptesAge.parAge[a] === 0 && age !== a"
            @click="age = age === a ? 'tous' : a"
          >
            {{ a }} <span class="tabular-nums opacity-60">{{ comptesAge.parAge[a] }}</span>
          </button>
        </div>
      </div>

      <div>
        <span class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Ce que propose le praticien</span>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            :class="[CLASSE_PASTILLE, bilans === 'oui' ? CLASSE_ACTIVE : CLASSE_INACTIVE]"
            :aria-pressed="bilans === 'oui'"
            :disabled="compteBilans === 0 && bilans !== 'oui'"
            @click="bilans = bilans === 'oui' ? 'tous' : 'oui'"
          >
            Réalise des bilans <span class="tabular-nums opacity-60">{{ compteBilans }}</span>
          </button>
          <button
            type="button"
            :class="[CLASSE_PASTILLE, tele === 'oui' ? CLASSE_ACTIVE : CLASSE_INACTIVE]"
            :aria-pressed="tele === 'oui'"
            :disabled="compteTele === 0 && tele !== 'oui'"
            @click="tele = tele === 'oui' ? 'tous' : 'oui'"
          >
            Téléconsultation <span class="tabular-nums opacity-60">{{ compteTele }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-wrap pt-4 mt-4 border-t border-gray-100">
      <span class="text-xs font-semibold text-gray-500">
        {{ filtresActifs.length ? 'Filtres actifs :' : 'Aucun filtre — toutes les fiches sont affichées.' }}
      </span>
      <span
        v-for="f in filtresActifs"
        :key="f.libelle"
        class="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full pl-3 pr-1 py-1 text-xs font-semibold"
      >
        {{ f.libelle }}
        <button type="button" class="px-1 leading-none text-sm hover:text-indigo-900" :aria-label="`Retirer le filtre ${f.libelle}`" @click="f.retirer()">×</button>
      </span>
      <button v-if="filtresActifs.length" type="button" class="ml-auto text-xs text-gray-500 underline hover:text-gray-700" @click="toutEffacer">
        Tout effacer
      </button>
    </div>
  </div>
</template>
