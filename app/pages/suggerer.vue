<script setup lang="ts">
import { TYPES_PRATICIENS, AGES_OPTIONS } from '~/types/index'

useSeoMeta({
  title: 'Suggérer un praticien — Annuaire TSA',
  description: 'Vous connaissez un praticien spécialisé dans l\'autisme qui n\'apparaît pas encore dans l\'Annuaire TSA ? Signalez-le ici pour l\'ajouter et aider d\'autres familles à le trouver.'
})

const { suggererPraticien } = useApi()

const form = reactive({
  nom: '',
  type: '',
  ville: '',
  codepostal: '',
  ville2: '',
  codepostal2: '',
  telephone: '',
  site_web: '',
  adeli: '',
  ages: [] as string[],
  typesIntervention: '',
  bilans: '',
  formations: '',
  experience: '',
  modalites: '',
  tarifs: '',
  autresInfos: '',
  consentement: false,
  hp: ''
})

const types = TYPES_PRATICIENS
const agesOptions = AGES_OPTIONS

// Une structure n'est pas une personne physique : elle ne peut pas avoir de RPPS,
// qui identifie un professionnel. On lui demande son SIRET ou son FINESS, tout
// aussi vérifiables et publics.
const estStructure = computed(() => form.type === 'Structure')

function toggleAge(age: string) {
  const idx = form.ages.indexOf(age)
  if (idx === -1) form.ages.push(age)
  else form.ages.splice(idx, 1)
}

const secondLieuOuvert = ref(false)

// Sept rubriques texte simple, remplaçant l'ancienne note unique en HTML
// libre (Tiptap) : chaque section a désormais son propre champ, plutôt que
// de dépendre d'un libellé tapé à la main. Le plafond de chacune correspond
// à celui vérifié côté API.
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

async function soumettre() {
  error.value = ''
  if (form.hp) return
  if (!form.nom || !form.type || !form.ville || !form.codepostal || !form.ages.length || !form.consentement) {
    error.value = 'Merci de remplir tous les champs obligatoires et cocher le consentement RGPD.'
    return
  }
  loading.value = true
  try {
    await suggererPraticien({
      nom: form.nom,
      type: form.type,
      ville: form.ville,
      departement: departementDepuisSaisie(form.codepostal),
      ville2: secondLieuOuvert.value && form.ville2 ? form.ville2 : null,
      departement2: secondLieuOuvert.value && form.codepostal2 ? departementDepuisSaisie(form.codepostal2) : null,
      telephone: form.telephone || null,
      site_web: form.site_web || null,
      types_intervention: form.typesIntervention || null,
      bilans: form.bilans || null,
      formations: form.formations || null,
      experience: form.experience || null,
      modalites: form.modalites || null,
      tarifs: form.tarifs || null,
      autres_infos: form.autresInfos || null,
      adeli: form.adeli || null,
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

    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-16" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-3xl mx-auto px-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Retour à l'annuaire
        </NuxtLink>
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Suggérer un praticien</h1>
        <p class="text-gray-500 text-lg max-w-2xl">Vous connaissez un praticien spécialisé TSA qui n'apparaît pas ? Signalez-le ici : nom, ville et spécialité suffisent.</p>
      </div>
    </section>

    <!-- SUCCÈS -->
    <section v-if="success" class="bg-gray-50 py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 text-3xl">
          ✅
        </div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Suggestion envoyée !</h2>
        <p class="text-gray-500 mb-8">Merci pour votre contribution. La fiche sera examinée avant publication.</p>
        <NuxtLink to="/" class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
          ← Retour à l'annuaire
        </NuxtLink>
      </div>
    </section>

    <!-- FORMULAIRE -->
    <section v-else class="bg-gray-50 min-h-screen py-12">
      <div class="max-w-3xl mx-auto px-6 space-y-5">

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          ⚠️ {{ error }}
        </div>

        <!-- Les règles avant le formulaire, et non après : quelqu'un qui remplit dix
             champs pour rien s'en souvient. Rédigées du point de vue de l'annuaire —
             « nous vérifions » et non « vous devez » — parce que le lecteur est ici le
             plus souvent un parent, et que le champ de l'identifiant lui reste
             facultatif : la page d'accueil promet que le nom, la ville et la spécialité
             suffisent. -->
        <section class="bg-white rounded-2xl border-2 border-gray-900 shadow-sm p-6" aria-labelledby="regles-admission">
          <h2 id="regles-admission" class="font-black text-gray-900 text-lg mb-1 flex items-center gap-2">
            <span aria-hidden="true">🛡️</span> Ce que nous vérifions avant de publier une fiche
          </h2>
          <p class="text-sm text-gray-500">Trois règles, appliquées à chaque fiche.</p>

          <p class="bg-gray-50 rounded-xl px-4 py-3.5 mt-5 text-sm text-gray-700">
            Vous n'avez rien à vérifier vous-même : indiquez ce que vous savez, nous faisons le reste.
          </p>

          <ol class="mt-5 space-y-5 text-sm text-gray-700">
            <li>
              <strong class="block text-gray-900 mb-1">1. L'identifiant professionnel — sans exception</strong>
              Nous vérifions que le praticien possède un numéro RPPS ou ADELI, délivré par l'Agence
              régionale de santé après contrôle du diplôme. C'est la seule barrière simple contre les
              charlatans, nombreux autour de l'autisme. Une fiche dont le numéro reste introuvable n'est
              pas publiée ; une fiche déjà en ligne dans ce cas est retirée.
            </li>
            <li>
              <strong class="block text-gray-900 mb-1">2. Une activité de consultation en cours, et un moyen de contact</strong>
              Nous cherchons au moins l'un de ces éléments : une inscription à l'annuaire national des
              professionnels de santé, une page de prise de rendez-vous, un site professionnel à jour, ou
              un référencement institutionnel — dispositif Mon soutien psy, réseau régional, structure de
              soin. Un identifiant valide ne suffit pas : un annuaire qui oriente des familles ne peut pas
              renvoyer vers un cabinet fermé.
              Nous vérifions aussi qu'une famille peut joindre le praticien : un téléphone, un site, une
              page de rendez-vous, ou le formulaire de contact de sa fiche. Une fiche qui n'offre aucun de
              ces moyens ne mène nulle part ; elle est retirée, et republiée dès qu'un moyen de contact
              existe.
            </li>
            <li>
              <strong class="block text-gray-900 mb-1">3. ADELI ou RPPS, les deux comptent</strong>
              Les psychologues basculent progressivement de l'ADELI vers le RPPS depuis juin 2024.
              Les deux numéros sont acceptés le temps de cette bascule.
            </li>
          </ol>

          <p class="text-sm text-gray-500 mt-5 pt-4 border-t border-gray-100">
            Une structure — cabinet, centre, institut — n'est pas une personne physique et n'a pas de
            RPPS : son SIRET ou son FINESS peut être indiqué, sans être exigé. Ces vérifications sont
            faites à la publication et à chaque signalement.
          </p>
        </section>

        <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
          ℹ️ Les informations soumises sont utilisées uniquement pour alimenter l'annuaire. Les champs marqués * sont obligatoires.
        </div>

        <!-- Identité -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base">👤</span>
            Identité du praticien
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="nom" class="block text-sm font-semibold text-gray-700 mb-1.5">Nom et prénom *</label>
              <input id="nom" v-model="form.nom" type="text" placeholder="Dr Marie Dupont" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="type" class="block text-sm font-semibold text-gray-700 mb-1.5">Type de professionnel *</label>
              <select id="type" v-model="form.type" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all">
                <option value="">— Choisir —</option>
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="mt-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Public reçu *</label>
            <div class="flex flex-wrap gap-3">
              <label v-for="age in agesOptions" :key="age" class="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" :checked="form.ages.includes(age)" class="checkbox-custom" @change="toggleAge(age)" />
                {{ age }}
              </label>
            </div>
          </div>
          <div class="mt-5">
            <label for="adeli" class="block text-sm font-semibold text-gray-700 mb-1.5">
              {{ estStructure ? 'Numéro SIRET ou FINESS' : 'Numéro RPPS ou ADELI' }}
              <span class="text-gray-500 font-normal ml-1">(optionnel)</span>
            </label>
            <input id="adeli" v-model="form.adeli" type="text" aria-describedby="adeli-aide"
              :placeholder="estStructure ? 'Ex. 12345678901234' : 'Ex. 10001234567'"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            <!-- Le critère s'appliquait sans être annoncé : des praticiens exerçant une
                 activité non réglementée envoyaient une suggestion de bonne foi, refusée
                 ensuite sans qu'ils puissent le savoir — le formulaire ne collecte aucune
                 adresse, on ne peut donc pas les prévenir. Le champ reste facultatif : la
                 page d'accueil promet « Nom, ville et spécialité suffisent », et une
                 famille qui signale un praticien ne connaît pas son numéro. -->
            <p id="adeli-aide" class="text-xs text-gray-500 mt-2 leading-relaxed">
              <template v-if="estStructure">
                Facultatif pour une structure. Un SIRET ou un FINESS permet de la vérifier
                plus vite, mais son absence n'empêche pas la publication.
              </template>
              <template v-else>
                Vous n'êtes pas obligé de le connaître. L'annuaire ne référence que des praticiens
                inscrits au répertoire national et dont l'activité est vérifiable : une fiche qui ne
                remplit pas ces deux conditions n'est pas publiée.
              </template>
            </p>
          </div>
        </div>

        <!-- Localisation -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">📍</span>
            Localisation
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="ville" class="block text-sm font-semibold text-gray-700 mb-1.5">Ville *</label>
              <input id="ville" v-model="form.ville" type="text" placeholder="Bordeaux" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="codepostal" class="block text-sm font-semibold text-gray-700 mb-1.5">Code postal *</label>
              <input id="codepostal" v-model="form.codepostal" type="text" placeholder="33000" maxlength="5" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
          </div>

          <button v-if="!secondLieuOuvert" type="button" class="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" @click="secondLieuOuvert = true">
            + Ajouter un second lieu
          </button>
          <div v-else class="mt-5 pt-5 border-t border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-semibold text-gray-700">Second lieu</p>
              <button type="button" class="text-xs text-gray-500 hover:text-gray-700 transition-colors" @click="secondLieuOuvert = false; form.ville2 = ''; form.codepostal2 = ''">
                Retirer
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="ville2" class="block text-sm font-semibold text-gray-700 mb-1.5">Ville</label>
                <input id="ville2" v-model="form.ville2" type="text" placeholder="Étampes" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
              </div>
              <div>
                <label for="codepostal2" class="block text-sm font-semibold text-gray-700 mb-1.5">Code postal</label>
                <input id="codepostal2" v-model="form.codepostal2" type="text" placeholder="91150" maxlength="5" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
              </div>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-base">📞</span>
            Contact
            <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="telephone" class="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
              <input id="telephone" v-model="form.telephone" type="tel" placeholder="05 56 12 34 56" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="site_web" class="block text-sm font-semibold text-gray-700 mb-1.5">Site web ou Doctolib</label>
              <input id="site_web" v-model="form.site_web" type="url" placeholder="https://…" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
          </div>
        </div>

        <!-- Notes, en sept rubriques nommées plutôt qu'un seul bloc de texte
             libre : ça guide la saisie autant que ça la simplifie, et ça évite
             qu'une information atterrisse sous le mauvais libellé, ou sous
             aucun. -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-base">📝</span>
            Informations complémentaires
            <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
          </h2>

          <div class="space-y-5">
            <div v-for="r in RUBRIQUES" :key="r.cle">
              <label :for="r.cle" class="block text-sm font-semibold text-gray-700 mb-1.5">{{ r.label }}</label>
              <textarea :id="r.cle" v-model="form[r.cle]" rows="3" :maxlength="r.max"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all resize-y" />
              <div class="flex items-baseline justify-between gap-3 mt-1.5">
                <p v-if="r.aide" class="text-xs text-gray-500">{{ r.aide }}</p>
                <span v-else />
                <p class="text-xs shrink-0 tabular-nums text-gray-400">{{ form[r.cle].length }} / {{ r.max }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Honeypot -->
        <input v-model="form.hp" type="text" name="email_confirm" autocomplete="off" aria-hidden="true" style="display:none" tabindex="-1" />

        <!-- RGPD + Actions -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <label class="flex items-start gap-3 cursor-pointer mb-6">
            <input v-model="form.consentement" type="checkbox" class="checkbox-custom mt-0.5 shrink-0" />
            <span class="text-sm text-gray-600">J'accepte que les informations soient utilisées pour alimenter l'annuaire TSA et qu'elles soient visibles publiquement. *</span>
          </label>
          <div class="flex justify-end gap-3">
            <NuxtLink to="/" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </NuxtLink>
            <!-- notesTropLongues a disparu avec l'éditeur Tiptap : le garde-fou
                 est désormais le maxlength de chaque rubrique, aligné sur les
                 plafonds vérifiés par l'API. -->
            <button type="button" :disabled="loading" class="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors" @click="soumettre">
              {{ loading ? 'Envoi…' : 'Envoyer la suggestion →' }}
            </button>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<style scoped>
/* Checkbox blanche, fiable sur tous mobiles */
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
