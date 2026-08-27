<script setup lang="ts">
import { TYPES_PRATICIENS, AGES_OPTIONS, DELAIS_PRATICIEN } from '~/types/index'

useSeoMeta({
  title: 'Suggérer un praticien — Annuaire TSA',
  description: 'Vous connaissez un praticien spécialisé dans l\'autisme qui n\'apparaît pas encore dans l\'Annuaire TSA ? Signalez-le ici pour l\'ajouter et aider d\'autres familles à le trouver.'
})

const { suggererPraticien } = useApi()

const champ = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all'

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

const etape = ref(1)

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

const libelleEtape = computed(() => {
  if (etape.value === 1) return 'Qui écrit'
  if (etape.value === 2) return estPraticien.value ? 'Votre fiche' : 'Le praticien'
  return 'Compléter'
})

const titreEtape = computed(() => {
  if (etape.value === 1) return 'Qui remplit ?'
  if (etape.value === 2) return estPraticien.value ? 'Les informations de la fiche' : 'Ce qu’il faut pour le trouver'
  return 'Le reste est facultatif'
})

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

watch(etape, async () => {
  if (!import.meta.client) return
  await nextTick()
  // scrollTo(0) masquait le haut du formulaire sous la barre sticky (h-16) à
  // chaque changement d'étape — l'effet « menu qui recouvre le type de pro ».
  document.getElementById('etape-suggerer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

function continuer() {
  error.value = ''
  if (etape.value < 3) etape.value++
  else void soumettre()
}

async function soumettre() {
  error.value = ''
  if (form.hp) return
  if (!form.nom || !form.type || !form.ville || !form.codepostal || !form.ages.length || !form.consentement) {
    error.value = 'Merci de remplir tous les champs obligatoires et cocher le consentement RGPD.'
    if (!form.nom || !form.type || !form.ville || !form.codepostal || !form.ages.length) etape.value = 2
    return
  }
  loading.value = true
  try {
    await suggererPraticien({
      nom: form.nom,
      type: form.type,
      adresse: form.adresse || null,
      ville: form.ville,
      departement: departementDepuisSaisie(form.codepostal),
      adresse2: secondLieuOuvert.value && form.adresse2 ? form.adresse2 : null,
      ville2: secondLieuOuvert.value && form.ville2 ? form.ville2 : null,
      departement2: secondLieuOuvert.value && form.codepostal2 ? departementDepuisSaisie(form.codepostal2) : null,
      telephone: form.telephone || null,
      site_web: form.site_web || null,
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
    const err = e as { data?: { error?: string } }
    error.value = err?.data?.error ?? 'Une erreur est survenue. Réessayez dans un instant.'
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
        <p class="text-gray-500 mb-8">Merci pour votre contribution. La fiche sera examinée avant publication.</p>
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
        <div class="mb-3 flex gap-2" aria-label="Progression">
          <div
            v-for="n in 3"
            :key="n"
            class="h-1.5 flex-1 rounded-full"
            :class="n <= etape ? 'bg-indigo-600' : 'bg-indigo-200'"
          />
        </div>
        <p class="text-xs font-semibold uppercase tracking-wide text-indigo-700">Étape {{ etape }} sur 3 — {{ libelleEtape }}</p>
        <h1 id="etape-suggerer" class="mt-2 text-3xl sm:text-4xl font-black text-gray-900 tracking-tight scroll-mt-20">{{ titreEtape }}</h1>
        <p v-if="etape === 1" class="mt-3 text-gray-500 text-lg max-w-2xl">
          <template v-if="estPraticien">Elle sera relue avant d’être publiée. Ce n’est pas un compte : vous ne pourrez pas la modifier ensuite.</template>
          <template v-else>Vous connaissez un praticien spécialisé TSA qui n’apparaît pas ? Nom, ville et spécialité suffisent.</template>
        </p>
        <p v-else-if="etape === 3" class="mt-3 text-gray-500">
          Tout est facultatif sur cet écran, sauf la case en bas. Vous pouvez envoyer sans rien remplir ici.
        </p>

        <div class="mt-8 space-y-5">
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            ⚠️ {{ error }}
          </div>

          <template v-if="etape === 1">
            <section class="bg-gray-50 border border-gray-200 border-l-4 border-l-indigo-500 rounded-r-2xl p-5" aria-labelledby="regles-admission">
              <h2 id="regles-admission" class="font-bold text-gray-900 mb-2">Une seule condition bloquante</h2>
              <p class="text-sm text-gray-700 leading-relaxed">
                L'annuaire ne référence que des praticiens inscrits au répertoire national
                (RPPS ou ADELI) et dont l'activité est vérifiable. <strong>Nous faisons cette
                vérification nous-même</strong> — vous n'avez rien à prouver, indiquez ce que
                vous savez.
              </p>
              <details class="mt-3">
                <summary class="text-sm font-semibold text-indigo-700 cursor-pointer hover:text-indigo-800">
                  Voir les trois règles en détail
                </summary>
                <ol class="mt-4 space-y-4 text-sm text-gray-700">
                  <li>
                    <strong class="block text-gray-900 mb-1">1. L'identifiant professionnel — sans exception</strong>
                    Délivré par l'Agence régionale de santé après contrôle du diplôme. C'est la seule
                    barrière simple contre les charlatans, nombreux autour de l'autisme. Une fiche dont
                    le numéro reste introuvable n'est pas publiée ; une fiche déjà en ligne dans ce cas
                    est retirée.
                  </li>
                  <li>
                    <strong class="block text-gray-900 mb-1">2. Une activité en cours, et un moyen de contact</strong>
                    Inscription à l'annuaire national, page de prise de rendez-vous, site professionnel
                    à jour ou référencement institutionnel. Un annuaire qui oriente des familles ne peut
                    pas renvoyer vers un cabinet fermé. Une fiche qui n'offre aucun moyen de contact ne
                    mène nulle part : elle est retirée, et republiée dès qu'un moyen existe.
                  </li>
                  <li>
                    <strong class="block text-gray-900 mb-1">3. ADELI ou RPPS, les deux comptent</strong>
                    Les psychologues basculent progressivement de l'ADELI vers le RPPS depuis juin 2024.
                    Les deux numéros sont acceptés le temps de cette bascule.
                  </li>
                </ol>
                <p class="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-200">
                  Une structure — cabinet, centre, institut — n'est pas une personne physique et n'a pas
                  de RPPS : son SIRET ou son FINESS peut être indiqué, sans être exigé.
                </p>
              </details>
            </section>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-colors" :class="role === 'famille' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'">
                  <input v-model="role" type="radio" value="famille" class="mt-1 accent-indigo-600 shrink-0">
                  <span>
                    <span class="block text-sm font-semibold text-gray-900">Une famille, un proche, un visiteur</span>
                    <span class="block text-xs text-gray-600 mt-1 leading-relaxed">Vous signalez un praticien que vous connaissez. On ne vous demandera que ce que vous pouvez savoir.</span>
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
          </template>

          <template v-else-if="etape === 2">
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
                <p class="block text-sm font-semibold text-gray-700 mb-2">Public reçu *</p>
                <div class="flex flex-wrap gap-3">
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
                        Cette case affiche le badge sur l’annuaire. Le détail se décrit à l’étape suivante, si vous voulez.
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
                  {{ estStructure ? 'Numéro SIRET ou FINESS' : 'Numéro RPPS ou ADELI' }}
                  <span class="text-gray-500 font-normal ml-1">(optionnel)</span>
                </label>
                <input
                  id="adeli"
                  v-model="form.adeli"
                  type="text"
                  aria-describedby="adeli-aide"
                  :placeholder="estStructure ? 'Ex. 12345678901234' : 'Ex. 10001234567'"
                  :class="champ"
                >
                <p id="adeli-aide" class="text-xs text-gray-500 mt-2 leading-relaxed">
                  <template v-if="estStructure">
                    Facultatif pour une structure. Un SIRET ou un FINESS permet de la vérifier
                    plus vite, mais son absence n'empêche pas la publication.
                  </template>
                  <template v-else-if="estPraticien">
                    Votre numéro accélère la publication. Sans lui on le cherche ; introuvable, la fiche n’est pas mise en ligne.
                  </template>
                  <template v-else>
                    Vous n’êtes pas obligé de le connaître. Si vous l’avez, la vérification va plus vite.
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
                  <label for="codepostal" class="block text-sm font-semibold text-gray-700 mb-1.5">Code postal *</label>
                  <input id="codepostal" v-model="form.codepostal" type="text" placeholder="33000" maxlength="5" :class="champ">
                </div>
              </div>
              <button v-if="!secondLieuOuvert" type="button" class="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" @click="secondLieuOuvert = true">
                + Ajouter un second lieu
              </button>
              <div v-else class="mt-5 pt-5 border-t border-gray-100">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-sm font-semibold text-gray-700">Second lieu</p>
                  <button type="button" class="text-xs text-gray-500 hover:text-gray-700 transition-colors" @click="secondLieuOuvert = false; form.adresse2 = ''; form.ville2 = ''; form.codepostal2 = ''">
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
                    <label for="codepostal2" class="block text-sm font-semibold text-gray-700 mb-1.5">Code postal</label>
                    <input id="codepostal2" v-model="form.codepostal2" type="text" placeholder="91150" maxlength="5" :class="champ">
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
          </template>

          <template v-else>
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-1 pb-4 border-b border-gray-100 flex items-center">
                Comment le joindre
                <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
              </h2>
              <p v-if="estPraticien" class="text-xs text-gray-500 mt-3 mb-4">Un téléphone ou un site aide à confirmer que l’activité est en cours.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5" :class="estPraticien ? '' : 'mt-5'">
                <div>
                  <label for="telephone" class="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
                  <input id="telephone" v-model="form.telephone" type="tel" placeholder="05 56 12 34 56" :class="champ">
                </div>
                <div>
                  <label for="site_web" class="block text-sm font-semibold text-gray-700 mb-1.5">Site web ou Doctolib</label>
                  <input id="site_web" v-model="form.site_web" type="url" placeholder="https://…" :class="champ">
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-5 pb-4 border-b border-gray-100 flex items-center">
                {{ estPraticien ? 'Votre pratique' : 'Ce que vous savez de lui' }}
                <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
              </h2>
              <div v-if="estPraticien" class="space-y-5">
                <p class="text-sm text-gray-600">Vous pouvez n’en remplir qu’une. Le champ Bilans précise la case de l’étape 2, il ne la remplace pas.</p>
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
                    aria-describedby="contact-auteur-aide"
                    :class="champ"
                  >
                </div>
                <p id="contact-auteur-aide" class="text-sm text-gray-600 leading-relaxed bg-gray-50 border-l-4 border-l-indigo-400 rounded-r-xl px-4 py-3">
                  Si un renseignement manque, ou si la suggestion ne peut pas être publiée, je vous l’écris à cette adresse. Elle n’apparaît pas sur le site.
                </p>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <label class="flex items-start gap-3 cursor-pointer">
                <input v-model="form.consentement" type="checkbox" class="checkbox-custom mt-0.5 shrink-0">
                <span class="text-sm text-gray-600">J'accepte que les informations soient utilisées pour alimenter l'annuaire TSA et qu'elles soient visibles publiquement. *</span>
              </label>
            </div>
          </template>

          <input v-model="form.hp" type="text" name="email_confirm" autocomplete="off" aria-hidden="true" style="display:none" tabindex="-1">

          <div class="flex justify-end gap-3">
            <button
              v-if="etape > 1"
              type="button"
              class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              @click="etape--"
            >
              Retour
            </button>
            <NuxtLink
              v-else
              to="/"
              class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </NuxtLink>
            <button
              type="button"
              :disabled="loading"
              class="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
              @click="continuer"
            >
              {{ loading ? 'Envoi…' : (etape === 3 ? 'Envoyer la suggestion →' : 'Continuer') }}
            </button>
          </div>
        </div>
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
