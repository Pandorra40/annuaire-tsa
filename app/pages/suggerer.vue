<script setup lang="ts">
import { TYPES_PRATICIENS, AGES_OPTIONS, DELAIS_PRATICIEN } from '~/types/index'
import { normaliserUrl } from '~/utils/url'

usePageSeo({
  title: 'Suggérer un praticien — Annuaire TSA',
  description: 'Vous connaissez un praticien spécialisé dans l\'autisme qui n\'apparaît pas encore dans l\'Annuaire TSA ? Signalez-le ici pour l\'ajouter et aider d\'autres familles à le trouver.',
  path: '/suggerer',
  noindex: true
})

const { suggererPraticien } = useApi()
const falcMode = useFalcMode()

const champ = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 bg-gray-50 text-gray-900 transition-all'

const form = reactive({
  nom: '',
  type: '',
  adresse: '',
  ville: '',
  codepostal: '',
  adresse2: '',
  ville2: '',
  codepostal2: '',
  telephone: '',
  site_web: '',
  teleconsultation: false,
  delai: '',
  adeli: '',
  ages: [] as string[],
  typesIntervention: '',
  bilans: '',
  formations: '',
  experience: '',
  modalites: '',
  tarifs: '',
  autresInfos: '',
  faitBilans: false,
  ceQueJeSais: '',
  contactAuteur: '',
  consentement: false,
  hp: ''
})

const types = TYPES_PRATICIENS
const agesOptions = AGES_OPTIONS
const delais = DELAIS_PRATICIEN

// Une structure n'est pas une personne physique : elle ne peut pas avoir de RPPS,
// qui identifie un professionnel. On lui demande son SIRET ou son FINESS, tout
// aussi vérifiables et publics.
const estStructure = computed(() => form.type === 'Structure')

// Qui remplit ? C'est le nœud de cette page. Un parent connaît le nom, la
// ville et la spécialité — la page d'accueil le lui promet — mais ni les
// tarifs, ni les formations, ni le parcours. Lui présenter les sept rubriques
// détaillées d'un praticien, c'est démentir cette promesse et récolter au
// mieux des approximations.
const role = ref<'famille' | 'praticien'>('famille')
const estPraticien = computed(() => role.value === 'praticien')

const labelNom = computed(() => estStructure.value ? 'Nom de la structure *' : 'Nom et prénom *')
const exempleNom = computed(() => estStructure.value ? 'Institut Mentis Portae' : 'Dr Marie Dupont')

const titrePage = computed(() => estPraticien.value ? 'Votre suggestion' : 'Signaler un praticien')

function toggleAge(age: string) {
  const idx = form.ages.indexOf(age)
  if (idx === -1) form.ages.push(age)
  else form.ages.splice(idx, 1)
}

const secondLieuOuvert = ref(false)

const RUBRIQUES = [
  { cle: 'typesIntervention', label: 'Types d\'intervention', aide: 'Communication, ABA, TEACCH, guidance parentale…', max: 1500 },
  { cle: 'bilans', label: 'Bilans', aide: 'ADI-R, ADOS, WISC, bilan de compétences…', max: 1000 },
  { cle: 'formations', label: 'Formations complémentaires', aide: '', max: 1000 },
  { cle: 'experience', label: 'Expérience', aide: '', max: 1500 },
  { cle: 'modalites', label: 'Modalités', aide: 'Cabinet, domicile, téléconsultation, horaires…', max: 800 },
  { cle: 'tarifs', label: 'Tarifs', aide: '', max: 500 },
  { cle: 'autresInfos', label: 'Autres informations', aide: 'Tout ce qui ne rentre pas ci-dessus — supervision de structures, parcours, partenariats…', max: 2000 }
] as const

const loading = ref(false)
const success = ref(false)
const error = ref('')
/** Erreurs rattachées à un champ (adeli, telephone, site_web, contact_auteur…). */
const erreursChamps = reactive<Record<string, string>>({})

function viderErreursChamps() {
  for (const k of Object.keys(erreursChamps)) {
    Reflect.deleteProperty(erreursChamps, k)
  }
}

function idChamp(field: string): string {
  if (field === 'contact_auteur') return 'contact-auteur'
  if (field === 'codePostal') return 'codepostal'
  return field
}

async function pointerChamp(field: string) {
  await nextTick()
  const el = document.getElementById(idChamp(field))
  el?.focus()
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function soumettre() {
  error.value = ''
  viderErreursChamps()
  if (form.hp) return
  if (!form.nom || !form.type || !form.ville || !form.codePostal || !form.ages.length || !form.consentement) {
    error.value = 'Merci de remplir tous les champs obligatoires et cocher le consentement RGPD.'
    const premierManquant = !form.nom
      ? 'nom'
      : !form.type
        ? 'type'
        : !form.ville
          ? 'ville'
          : !form.codePostal
            ? 'codePostal'
            : !form.ages.length
              ? 'ages'
              : 'consentement'
    await pointerChamp(premierManquant)
    return
  }

  // Aligné sur l'API : RPPS/ADELI obligatoire pour une personne physique.
  const adeliBrut = form.adeli.replace(/[\s.-]/g, '').trim()
  if (form.type !== 'Structure' && !adeliBrut) {
    const msg = 'Le numéro RPPS ou ADELI est obligatoire. Sans identifiant, la fiche ne peut pas être publiée.'
    erreursChamps.adeli = msg
    error.value = msg
    await pointerChamp('adeli')
    return
  }
  if (adeliBrut) {
    const ok = form.type === 'Structure'
      ? /^\d{14}$|^\d{9}$/.test(adeliBrut)
      : /^\d{11}$|^\d{9}$/.test(adeliBrut)
    if (!ok) {
      const msg = form.type === 'Structure'
        ? 'Identifiant invalide : 14 chiffres (SIRET) ou 9 chiffres (FINESS) attendus.'
        : 'Identifiant invalide : 11 chiffres (RPPS) ou 9 chiffres (ADELI) attendus.'
      erreursChamps.adeli = msg
      error.value = msg
      await pointerChamp('adeli')
      return
    }
  }

  const siteWeb = normaliserUrl(form.site_web)
  if (siteWeb) form.site_web = siteWeb
  const telephone = form.telephone.trim()
  if (!telephone && !siteWeb) {
    const msg = 'Indiquez un téléphone ou un site web : sans moyen de contact, la fiche ne peut pas être publiée.'
    erreursChamps.telephone = msg
    error.value = msg
    await pointerChamp('telephone')
    return
  }

  loading.value = true
  try {
    await suggererPraticien({
      nom: form.nom,
      type: form.type,
      adresse: form.adresse || null,
      ville: form.ville,
      departement: departementDepuisSaisie(form.codePostal),
      adresse2: secondLieuOuvert.value && form.adresse2 ? form.adresse2 : null,
      ville2: secondLieuOuvert.value && form.ville2 ? form.ville2 : null,
      departement2: secondLieuOuvert.value && form.codePostal2 ? departementDepuisSaisie(form.codePostal2) : null,
      telephone: telephone || null,
      site_web: siteWeb || null,
      teleconsultation: form.teleconsultation,
      delai: form.delai || null,
      types_intervention: (estPraticien.value && form.typesIntervention) || null,
      bilans: (estPraticien.value && form.bilans) || null,
      formations: (estPraticien.value && form.formations) || null,
      experience: (estPraticien.value && form.experience) || null,
      modalites: (estPraticien.value && form.modalites) || null,
      tarifs: (estPraticien.value && form.tarifs) || null,
      // Ce qu'un proche sait de la pratique rejoint « autres informations » :
      // c'est le fourre-tout prévu pour ce qui ne relève d'aucune rubrique
      // précise, et il est plus honnête d'y mettre un témoignage que de le
      // ranger sous « Types d'intervention » comme s'il était vérifié.
      autres_infos: (estPraticien.value ? form.autresInfos : form.ceQueJeSais) || null,
      adeli: form.adeli || null,
      // Case décochée : on envoie null, « on ne sait pas », et surtout pas 0.
      fait_bilans: form.faitBilans ? 1 : null,
      contact_auteur: form.contactAuteur || null,
      ages: form.ages,
      statut: 'en_attente',
      source: 'communaute'
    })
    success.value = true
  } catch (e) {
    // Ne pas vider le formulaire : l'utilisateur corrige et renvoie.
    const err = e as { data?: { error?: string, field?: string } }
    const msg = err?.data?.error ?? 'Une erreur est survenue. Réessayez dans un instant.'
    error.value = msg
    const field = err?.data?.field
    if (field) {
      erreursChamps[field] = msg
      await pointerChamp(field)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />

    <section v-if="success" class="bg-gray-50 py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 text-3xl">
          ✅
        </div>
        <h1 class="text-2xl font-bold mb-3 text-gray-900">Suggestion envoyée !</h1>
        <p class="text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">Merci. Chaque suggestion est relue à la main avant publication (souvent sous quelques jours). Ce n’est pas un compte : vous ne pourrez pas modifier la fiche ensuite sur le site.</p>
        <NuxtLink to="/" class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
          ← Retour à l'annuaire
        </NuxtLink>
      </div>
    </section>

    <section v-else class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Retour à l'annuaire
        </NuxtLink>

        <p class="text-sm text-gray-500 mb-1">Suggérer un praticien</p>
        <h1 class="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{{ titrePage }}</h1>
        <p v-if="!falcMode" class="mt-3 text-gray-500 text-lg max-w-2xl">
          <template v-if="estPraticien">Elle sera relue avant d’être publiée. Identifiant professionnel (RPPS ou ADELI) et un moyen de contact sont obligatoires. Ce n’est pas un compte : vous ne pourrez pas la modifier ensuite.</template>
          <template v-else>Vous connaissez un praticien spécialisé TSA qui n’apparaît pas ? Indiquez au minimum son identité, son numéro RPPS ou ADELI, et un moyen de le joindre.</template>
        </p>
        <div v-else class="mt-3 text-gray-500 text-lg max-w-2xl space-y-2">
          <template v-if="estPraticien">
            <p>Votre fiche sera lue avant d’être publiée.</p>
            <p>Le numéro RPPS ou ADELI est obligatoire.</p>
            <p>Il faut aussi un téléphone ou un site.</p>
            <p>Ce n’est pas un compte. Vous ne pourrez pas la modifier ensuite.</p>
          </template>
          <template v-else>
            <p>Vous connaissez un professionnel spécialisé en autisme qui n’est pas sur le site ?</p>
            <p>Il faut son nom, sa ville, son numéro officiel (RPPS ou ADELI), et un moyen de le joindre.</p>
          </template>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="soumettre">
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700" role="alert">
            ⚠️ {{ error }}
          </div>

          <section class="bg-gray-50 border border-gray-200 border-l-4 border-l-indigo-500 rounded-r-2xl p-5" aria-labelledby="regles-admission">
            <template v-if="!falcMode">
              <h2 id="regles-admission" class="font-bold text-gray-900 mb-2">Conditions pour être publié</h2>
              <p class="text-sm text-gray-700 leading-relaxed">
                L'annuaire ne référence que des praticiens inscrits au répertoire national
                (RPPS ou ADELI) et joignables. Ces deux éléments sont <strong>obligatoires sur ce
                formulaire</strong> — sans eux, la suggestion ne peut pas être publiée.
              </p>
              <details class="mt-3">
                <summary class="text-sm font-semibold text-indigo-700 cursor-pointer hover:text-indigo-800">
                  Voir les trois règles en détail
                </summary>
                <ol class="mt-4 space-y-4 text-sm text-gray-700">
                  <li>
                    <strong class="block text-gray-900 mb-1">1. L'identifiant professionnel — sans exception</strong>
                    Délivré par l'Agence régionale de santé après contrôle du diplôme. C'est la seule
                    barrière simple contre les charlatans, nombreux autour de l'autisme. Une suggestion
                    sans numéro n'est pas acceptée ; une fiche déjà en ligne sans numéro est retirée.
                  </li>
                  <li>
                    <strong class="block text-gray-900 mb-1">2. Une activité en cours, et un moyen de contact</strong>
                    Téléphone ou site professionnel (Doctolib, page du cabinet…). Une fiche sans moyen
                    de contact ne mène nulle part : elle n'est pas publiée.
                  </li>
                  <li>
                    <strong class="block text-gray-900 mb-1">3. ADELI ou RPPS, les deux comptent</strong>
                    Les psychologues basculent progressivement de l'ADELI vers le RPPS depuis juin 2024.
                    Les deux numéros sont acceptés le temps de cette bascule.
                  </li>
                </ol>
                <p class="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-200">
                  Une structure — cabinet, centre, institut — n'est pas une personne physique et n'a pas
                  de RPPS : son SIRET ou son FINESS peut être indiqué, sans être exigé. Un moyen de
                  contact reste obligatoire.
                </p>
              </details>
            </template>
            <div v-else class="text-sm text-gray-700 leading-relaxed space-y-3">
              <h2 id="regles-admission" class="font-bold text-gray-900">Règles importantes</h2>
              <p>Le numéro officiel (RPPS ou ADELI) est obligatoire.</p>
              <p>Sans ce numéro, la fiche n’est pas publiée.</p>
              <p>Il faut aussi un téléphone ou un site pour joindre le professionnel.</p>
              <p>Pour un cabinet ou un centre, le SIRET ou FINESS est facultatif. Le contact reste obligatoire.</p>
            </div>
          </section>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 class="font-bold text-gray-900 text-lg mb-5 pb-4 border-b border-gray-100">Qui remplit ?</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Qui remplit ce formulaire">
              <label class="flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-colors" :class="role === 'famille' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'">
                <input v-model="role" type="radio" value="famille" class="mt-1 accent-indigo-600 shrink-0">
                <span>
                  <span class="block text-sm font-semibold text-gray-900">Une famille, un proche, un visiteur</span>
                  <span class="block text-xs text-gray-600 mt-1 leading-relaxed">Vous signalez un praticien. Identifiant et contact restent obligatoires pour qu’il puisse être publié.</span>
                </span>
              </label>
              <label class="flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-colors" :class="role === 'praticien' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'">
                <input v-model="role" type="radio" value="praticien" class="mt-1 accent-indigo-600 shrink-0">
                <span>
                  <span class="block text-sm font-semibold text-gray-900">Le praticien lui-même</span>
                  <span class="block text-xs text-gray-600 mt-1 leading-relaxed">Le formulaire complet vous est proposé. Suggestion relue avant publication — ce n’est pas un compte.</span>
                </span>
              </label>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 class="font-bold text-gray-900 text-lg mb-5 pb-4 border-b border-gray-100">Identité</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="nom" class="block text-sm font-semibold text-gray-700 mb-1.5">{{ labelNom }}</label>
                <input id="nom" v-model="form.nom" type="text" :placeholder="exempleNom" :class="champ">
              </div>
              <div>
                <label for="type" class="block text-sm font-semibold text-gray-700 mb-1.5">Type de professionnel *</label>
                <select id="type" v-model="form.type" :class="champ">
                  <option value="">— Choisir —</option>
                  <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>
            <div class="mt-5">
              <p id="ages" class="block text-sm font-semibold text-gray-700 mb-2">Public reçu *</p>
              <div class="flex flex-wrap gap-3" role="group" aria-labelledby="ages">
                <label v-for="age in agesOptions" :key="age" class="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" :checked="form.ages.includes(age)" class="checkbox-custom" @change="toggleAge(age)">
                  {{ age }}
                </label>
              </div>
            </div>
            <div class="mt-5 bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
              <label class="flex items-start gap-3 cursor-pointer">
                <input v-model="form.faitBilans" type="checkbox" class="checkbox-custom mt-0.5 shrink-0">
                <span>
                  <span class="block text-sm font-semibold text-gray-800">Ce praticien réalise des bilans diagnostiques</span>
                  <span class="block text-xs text-gray-600 mt-1 leading-relaxed">
                    ADOS, ADI-R, WISC, évaluations à visée diagnostique.
                    <template v-if="estPraticien">
                      Cette case affiche le badge sur l’annuaire. Le détail peut se décrire plus bas, si vous voulez.
                    </template>
                    <template v-else>
                      <strong>Laissez décoché si vous ne savez pas</strong> —
                      une case décochée veut dire « on ne sait pas », jamais « il n'en fait pas ».
                    </template>
                  </span>
                </span>
              </label>
            </div>
            <div class="mt-5">
              <label for="adeli" class="block text-sm font-semibold text-gray-700 mb-1.5">
                <template v-if="estStructure">
                  Numéro SIRET ou FINESS
                  <span class="text-gray-500 font-normal ml-1">(facultatif)</span>
                </template>
                <template v-else>
                  Numéro RPPS ou ADELI *
                </template>
              </label>
              <input
                id="adeli"
                v-model="form.adeli"
                type="text"
                :required="!estStructure"
                :aria-describedby="erreursChamps.adeli ? 'adeli-erreur adeli-aide' : 'adeli-aide'"
                :aria-invalid="!!erreursChamps.adeli"
                :placeholder="estStructure ? 'Ex. 12345678901234' : 'Ex. 10001234567'"
                :class="[champ, erreursChamps.adeli ? 'border-red-400 focus:border-red-400 focus-visible:outline-red-600' : '']"
                @input="delete erreursChamps.adeli"
              >
              <p v-if="erreursChamps.adeli" id="adeli-erreur" class="text-xs text-red-600 mt-2">{{ erreursChamps.adeli }}</p>
              <p id="adeli-aide" class="text-xs text-gray-500 mt-2 leading-relaxed">
                <template v-if="estStructure">
                  Facultatif pour une structure. Un SIRET ou un FINESS aide à la vérifier plus vite.
                </template>
                <template v-else>
                  11 chiffres (RPPS) ou 9 chiffres (ADELI). Les deux sont acceptés. Sans ce numéro, la suggestion est refusée.
                </template>
              </p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 class="font-bold text-gray-900 text-lg mb-5 pb-4 border-b border-gray-100">{{ estPraticien ? 'Où consultez-vous ?' : 'Où consulte-t-il ?' }}</h2>
            <div class="mb-5">
              <label for="adresse" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse <span class="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <input id="adresse" v-model="form.adresse" type="text" placeholder="12 rue de la Paix" :class="champ">
              <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                Rue et numéro, si vous les connaissez — la ville et le code postal suffisent sinon.
              </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="ville" class="block text-sm font-semibold text-gray-700 mb-1.5">Ville *</label>
                <input id="ville" v-model="form.ville" type="text" placeholder="Bordeaux" :class="champ">
              </div>
              <div>
                <label for="codePostal" class="block text-sm font-semibold text-gray-700 mb-1.5">Code postal *</label>
                <input id="codePostal" v-model="form.codePostal" type="text" placeholder="33000" maxlength="5" :class="champ">
              </div>
            </div>
            <button v-if="!secondLieuOuvert" type="button" class="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" @click="secondLieuOuvert = true">
              + Ajouter un second lieu
            </button>
            <div v-else class="mt-5 pt-5 border-t border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold text-gray-700">Second lieu</p>
                <button type="button" class="text-xs text-gray-500 hover:text-gray-700 transition-colors" @click="secondLieuOuvert = false; form.adresse2 = ''; form.ville2 = ''; form.codePostal2 = ''">
                  Retirer
                </button>
              </div>
              <div class="mb-5">
                <label for="adresse2" class="block text-sm font-semibold text-gray-700 mb-1.5">Adresse</label>
                <input id="adresse2" v-model="form.adresse2" type="text" placeholder="97 avenue Charles de Gaulle" :class="champ">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label for="ville2" class="block text-sm font-semibold text-gray-700 mb-1.5">Ville</label>
                  <input id="ville2" v-model="form.ville2" type="text" placeholder="Étampes" :class="champ">
                </div>
                <div>
                  <label for="codePostal2" class="block text-sm font-semibold text-gray-700 mb-1.5">Code postal</label>
                  <input id="codePostal2" v-model="form.codePostal2" type="text" placeholder="91150" maxlength="5" :class="champ">
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 class="font-bold text-gray-900 text-lg mb-5 pb-4 border-b border-gray-100 flex items-center">
              Pratique
              <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
              <div>
                <label for="delai" class="block text-sm font-semibold text-gray-700 mb-1.5">Délai d'attente</label>
                <select id="delai" v-model="form.delai" :class="champ">
                  <option value="">— Je ne sais pas —</option>
                  <option v-for="d in delais" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <label class="flex items-start gap-3 cursor-pointer text-sm text-gray-700 sm:pt-8">
                <input v-model="form.teleconsultation" type="checkbox" class="checkbox-custom mt-0.5 shrink-0">
                <span>
                  <span class="block font-semibold text-gray-800">Propose la téléconsultation</span>
                  <span class="block text-xs text-gray-500 mt-1">Cochez seulement si vous en êtes sûr.</span>
                </span>
              </label>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 class="font-bold text-gray-900 text-lg mb-1 pb-4 border-b border-gray-100 flex items-center">
              Comment le joindre
              <span class="ml-auto text-xs text-gray-500 font-normal">Au moins un *</span>
            </h2>
            <p class="text-xs text-gray-500 mt-3 mb-4">Téléphone ou site web : l’un des deux suffit, les deux sont possibles. Sans moyen de contact, la fiche n’est pas publiée.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="telephone" class="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
                <input
                  id="telephone"
                  v-model="form.telephone"
                  type="tel"
                  placeholder="05 56 12 34 56"
                  :aria-invalid="!!erreursChamps.telephone"
                  :aria-describedby="erreursChamps.telephone ? 'telephone-erreur' : undefined"
                  :class="[champ, erreursChamps.telephone ? 'border-red-400 focus:border-red-400 focus-visible:outline-red-600' : '']"
                  @input="delete erreursChamps.telephone"
                >
                <p v-if="erreursChamps.telephone" id="telephone-erreur" class="text-xs text-red-600 mt-2">{{ erreursChamps.telephone }}</p>
              </div>
              <div>
                <label for="site_web" class="block text-sm font-semibold text-gray-700 mb-1.5">Site web ou Doctolib</label>
                <input
                  id="site_web"
                  v-model="form.site_web"
                  type="text"
                  inputmode="url"
                  autocomplete="url"
                  placeholder="www.doctolib.fr/…"
                  :aria-invalid="!!erreursChamps.site_web"
                  :aria-describedby="erreursChamps.site_web ? 'site_web-erreur' : undefined"
                  :class="[champ, erreursChamps.site_web ? 'border-red-400 focus:border-red-400 focus-visible:outline-red-600' : '']"
                  @input="delete erreursChamps.site_web; delete erreursChamps.telephone"
                >
                <p v-if="erreursChamps.site_web" id="site_web-erreur" class="text-xs text-red-600 mt-2">{{ erreursChamps.site_web }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 class="font-bold text-gray-900 text-lg mb-5 pb-4 border-b border-gray-100 flex items-center">
              {{ estPraticien ? 'Votre pratique' : 'Ce que vous savez de lui' }}
              <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
            </h2>
            <div v-if="estPraticien" class="space-y-5">
              <p class="text-sm text-gray-600">Vous pouvez n’en remplir qu’une. Le champ Bilans précise la case ci-dessus, il ne la remplace pas.</p>
              <div v-for="r in RUBRIQUES" :key="r.cle">
                <label :for="r.cle" class="block text-sm font-semibold text-gray-700 mb-1.5">{{ r.label }}</label>
                <textarea :id="r.cle" v-model="form[r.cle]" rows="3" :maxlength="r.max" :class="champ + ' resize-y'" />
                <div class="flex items-baseline justify-between gap-3 mt-1.5">
                  <p v-if="r.aide" class="text-xs text-gray-500">{{ r.aide }}</p>
                  <span v-else />
                  <p class="text-xs shrink-0 tabular-nums text-gray-400">{{ form[r.cle].length }} / {{ r.max }}</p>
                </div>
              </div>
            </div>
            <div v-else>
              <p class="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 mb-5">
                Les tarifs, les formations et le parcours ne vous sont pas demandés : vous n'avez pas
                de raison de les connaître, et une information approximative sur une fiche publique
                fait plus de mal que de bien. Nous les demanderons au praticien.
              </p>
              <label for="ceQueJeSais" class="block text-sm font-semibold text-gray-700 mb-1.5">
                En quelques mots <span class="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <textarea
                id="ceQueJeSais"
                v-model="form.ceQueJeSais"
                rows="3"
                maxlength="800"
                placeholder="Ce que vous savez de sa pratique : approches utilisées, public reçu, ce qui vous a marqué…"
                :class="champ + ' resize-y'"
              />
              <div class="flex items-baseline justify-between gap-3 mt-1.5">
                <p class="text-xs text-gray-500">Écrivez seulement ce dont vous êtes sûr. En cas de doute, laissez vide.</p>
                <p class="text-xs shrink-0 tabular-nums text-gray-400">{{ form.ceQueJeSais.length }} / 800</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 class="font-bold text-gray-900 text-lg mb-5 pb-4 border-b border-gray-100 flex items-center">
              Comment vous répondre
              <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
              <div>
                <label for="contact-auteur" class="block text-sm font-semibold text-gray-700 mb-1.5">Votre adresse électronique</label>
                <input
                  id="contact-auteur"
                  v-model="form.contactAuteur"
                  type="email"
                  autocomplete="email"
                  placeholder="vous@exemple.fr"
                  :aria-describedby="erreursChamps.contact_auteur ? 'contact-auteur-erreur contact-auteur-aide' : 'contact-auteur-aide'"
                  :aria-invalid="!!erreursChamps.contact_auteur"
                  :class="[champ, erreursChamps.contact_auteur ? 'border-red-400 focus:border-red-400 focus-visible:outline-red-600' : '']"
                  @input="delete erreursChamps.contact_auteur"
                >
                <p v-if="erreursChamps.contact_auteur" id="contact-auteur-erreur" class="text-xs text-red-600 mt-2">{{ erreursChamps.contact_auteur }}</p>
              </div>
              <p id="contact-auteur-aide" class="text-sm text-gray-600 leading-relaxed bg-gray-50 border-l-4 border-l-indigo-400 rounded-r-xl px-4 py-3">
                Si un renseignement manque, ou si la suggestion ne peut pas être publiée, je vous l’écris à cette adresse. Elle n’apparaît pas sur le site.
              </p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <label id="consentement" class="flex items-start gap-3 cursor-pointer">
              <input v-model="form.consentement" type="checkbox" class="checkbox-custom mt-0.5 shrink-0">
              <span class="text-sm text-gray-600">J'accepte que les informations soient utilisées pour alimenter l'annuaire TSA et qu'elles soient visibles publiquement. *</span>
            </label>
          </div>

          <input v-model="form.hp" type="text" name="email_confirm" autocomplete="off" aria-hidden="true" style="display:none" tabindex="-1">

          <div class="flex flex-wrap justify-end gap-3">
            <NuxtLink
              to="/"
              class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {{ loading ? 'Envoi…' : 'Envoyer la suggestion →' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.checkbox-custom {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  color-scheme: light;
}
.checkbox-custom:checked {
  background: #6366f1;
  border-color: #6366f1;
}
.checkbox-custom:checked::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: translateY(-1px) rotate(45deg);
}
</style>
