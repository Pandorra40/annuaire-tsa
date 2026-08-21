<script setup lang="ts">
import { MOTIF_RETRAIT, MOTIF_RETRAIT_ASSOCIATION } from '~/types/index'
import type { Association, Praticien } from '~/types/index'

useSeoMeta({
  title: 'Signaler une erreur — Annuaire TSA'
})

const route = useRoute()
const config = useRuntimeConfig()

// Cette page est prérendue : au premier rendu côté client, l'adresse est encore celle
// figée au build, sans paramètres. Une lecture unique de route.query renverrait donc du
// vide sur un chargement direct — et le signalement partait alors sans identifiant, que
// l'API refuse. Tout ce qui vient de l'URL doit rester réactif.
const id = computed(() => (route.query.id as string) || '')

// Un seul formulaire pour les deux fiches : la fiche association n'avait
// jusqu'ici aucun chemin de correction, contrairement à la fiche praticien.
// Plutôt qu'une deuxième page presque identique, le type distingue les deux
// dans les rubriques, le motif de retrait et l'identifiant envoyé à l'API.
const estAssociation = computed(() => route.query.type === 'association')

// Lien de retour : vers la fiche d'origine si on vient d'une fiche, sinon l'annuaire
const retour = computed(() => {
  if (!id.value) return '/'
  return estAssociation.value ? `/association/${id.value}` : `/praticien/${id.value}`
})

const MOTIF_CORRECTION = 'Informations incorrectes (adresse, téléphone…)'

const MOTIFS_PRATICIEN = [
  MOTIF_RETRAIT,
  MOTIF_CORRECTION,
  'Praticien n\'exerce plus',
  'Praticien n\'est pas spécialisé TSA',
  'Cabinet fermé',
  'Doublon',
  'Autre'
]

const MOTIFS_ASSOCIATION = [
  MOTIF_RETRAIT_ASSOCIATION,
  MOTIF_CORRECTION,
  'Association n\'existe plus',
  'Doublon',
  'Autre'
]

const motifs = computed(() => estAssociation.value ? MOTIFS_ASSOCIATION : MOTIFS_PRATICIEN)

// La fiche envoie ici avec un motif déjà choisi, pour que qui la gère n'ait
// pas à se reconnaître dans une liste écrite pour les visiteurs.
const raccourcis = computed<Record<string, string>>(() => ({
  correction: MOTIF_CORRECTION,
  retrait: estAssociation.value ? MOTIF_RETRAIT_ASSOCIATION : MOTIF_RETRAIT
}))

const form = reactive({
  motif: '',
  details: '',
  contactAuteur: ''
})

// La fiche visée, pour afficher la valeur actuelle en face de chaque correction.
// `server: false` est justifié ici, contrairement aux pages de liste : au build
// l'identifiant n'existe pas encore, il arrive par la barre d'adresse.
const { fetchPraticien, fetchAssociation } = useApi()
const { data: ficheChargee } = await useAsyncData(
  () => `signaler-fiche-${estAssociation.value ? 'a' : 'p'}-${id.value || 'aucune'}`,
  async () => {
    if (!id.value) return null
    return estAssociation.value ? await fetchAssociation(Number(id.value)) : await fetchPraticien(Number(id.value))
  },
  { watch: [id, estAssociation], server: false }
)
const fiche = computed<Praticien | Association | null>(() => ficheChargee.value?.[0] ?? null)

// Les rubriques corrigeables reprennent exactement les champs de la fiche —
// deux jeux distincts, une association n'ayant ni tarifs ni types
// d'intervention. C'est le cœur du correctif : un signalement « TARIF
// MODIFIÉ » sans le nouveau tarif devient impossible à produire, parce que
// cocher une rubrique ouvre le champ qui doit la remplacer.
const CHAMPS_PRATICIEN = [
  { cle: 'tarifs', label: 'Tarifs', lignes: 1 },
  { cle: 'types_intervention', label: 'Types d\'intervention', lignes: 3 },
  { cle: 'bilans', label: 'Bilans', lignes: 2 },
  { cle: 'formations', label: 'Formations complémentaires', lignes: 2 },
  { cle: 'experience', label: 'Expérience', lignes: 2 },
  { cle: 'modalites', label: 'Modalités', lignes: 2 },
  { cle: 'autres_infos', label: 'Autres informations', lignes: 3 },
  { cle: 'adresse', label: 'Adresse', lignes: 1 },
  { cle: 'ville', label: 'Ville', lignes: 1 },
  { cle: 'telephone', label: 'Téléphone', lignes: 1 },
  { cle: 'site_web', label: 'Site web ou prise de rendez-vous', lignes: 1 }
] as const

const CHAMPS_ASSOCIATION = [
  { cle: 'nom', label: 'Nom de l\'association', lignes: 1 },
  { cle: 'adresse', label: 'Adresse', lignes: 1 },
  { cle: 'ville', label: 'Ville', lignes: 1 },
  { cle: 'telephone', label: 'Téléphone', lignes: 1 },
  { cle: 'email', label: 'Adresse email', lignes: 1 },
  { cle: 'site_web', label: 'Site web', lignes: 1 },
  { cle: 'services', label: 'Services proposés', lignes: 2 },
  { cle: 'age_public', label: 'Public concerné', lignes: 1 },
  { cle: 'description', label: 'Présentation', lignes: 3 }
] as const

type CleChamp = typeof CHAMPS_PRATICIEN[number]['cle'] | typeof CHAMPS_ASSOCIATION[number]['cle']

const champsCorrigeables = computed(() => estAssociation.value ? CHAMPS_ASSOCIATION : CHAMPS_PRATICIEN)

const champsCoches = ref<CleChamp[]>([])
const corrections = reactive<Record<string, string>>({})

// Changer de fiche en cours de route n'arrive pas dans l'usage réel — l'URL
// fixe le type au chargement — mais si jamais, les cases cochées pour l'autre
// jeu de rubriques n'auraient plus de sens affichées.
watch(champsCorrigeables, () => {
  champsCoches.value = []
})

function basculerChamp(cle: CleChamp) {
  const i = champsCoches.value.indexOf(cle)
  if (i === -1) {
    champsCoches.value.push(cle)
  } else {
    champsCoches.value.splice(i, 1)
    // La saisie est vidée avec la case : garder une valeur pour une rubrique
    // décochée l'enverrait sans que personne ne l'ait voulu. Vidée et non
    // supprimée — `releveDesCorrections` ne parcourt que les cases cochées, et
    // effacer une clé dynamique n'apporte rien qu'une chaîne vide ne fasse.
    corrections[cle] = ''
  }
}

function valeurActuelle(cle: CleChamp): string {
  const valeur = (fiche.value as Record<string, unknown> | null)?.[cle]
  const texte = typeof valeur === 'string' ? valeur.trim() : ''
  return texte || 'Non renseigné'
}

const champsIncomplets = computed(() =>
  champsCoches.value.filter(cle => !(corrections[cle] ?? '').trim())
)

const pretAEnvoyer = computed(() =>
  champsCoches.value.length > 0 && champsIncomplets.value.length === 0
)

// Le relevé envoyé à l'admin : rubrique, valeur en ligne, valeur proposée.
// Composé côté client plutôt que stocké en colonnes séparées — un volume
// modeste de fiches est concerné à la fois, une table dédiée serait hors de
// proportion, et le texte reste lisible tel quel dans l'administration.
function releveDesCorrections(): string {
  return champsCoches.value
    .map((cle) => {
      const label = champsCorrigeables.value.find(c => c.cle === cle)?.label ?? cle
      return `${label}\n  actuel  : ${valeurActuelle(cle)}\n  corrigé : ${corrections[cle]?.trim()}`
    })
    .join('\n\n')
}

// Pour la même raison, le motif est appliqué dès que l'adresse réelle est connue, et
// une seule fois : un choix déjà fait par le visiteur ne doit pas être écrasé.
watch(() => route.query.motif, (valeur) => {
  const cible = raccourcis.value[valeur as string]
  if (cible && !form.motif) form.motif = cible
}, { immediate: true })

const demandeRetrait = computed(() => form.motif === MOTIF_RETRAIT || form.motif === MOTIF_RETRAIT_ASSOCIATION)
const demandeCorrection = computed(() => form.motif === MOTIF_CORRECTION)

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function soumettre() {
  error.value = ''
  if (!form.motif) {
    error.value = 'Merci de sélectionner un motif.'
    return
  }

  // Une demande de correction passe par les rubriques, pas par un champ libre :
  // c'est ce qui empêche un signalement du type « TARIF MODIFIÉ » sans le
  // nouveau tarif — reçu le 21 août, et resté sans suite possible.
  if (demandeCorrection.value) {
    if (!champsCoches.value.length) {
      error.value = 'Cochez au moins une rubrique à corriger.'
      return
    }
    if (champsIncomplets.value.length) {
      error.value = 'Indiquez la nouvelle valeur de chaque rubrique cochée : sans elle, la correction ne peut pas être appliquée.'
      return
    }
  } else if (!demandeRetrait.value && form.details.trim().length < 10) {
    // Les autres motifs gardent le champ libre. Seule la demande de retrait en
    // est dispensée — exiger une justification pour une opposition serait
    // contraire à l'article 21 du RGPD.
    error.value = 'Merci de décrire ce qui est inexact, et si possible la bonne information.'
    return
  }

  // Le commentaire libre reste possible en plus des rubriques, pour le contexte
  // qu'aucune case ne couvre.
  const detail = demandeCorrection.value
    ? [releveDesCorrections(), form.details.trim()].filter(Boolean).join('\n\n———\n')
    : form.details.trim()

  loading.value = true
  try {
    await $fetch(`${config.public.apiBase}/signalements.php`, {
      method: 'POST',
      body: {
        praticien_id: estAssociation.value ? null : id.value,
        association_id: estAssociation.value ? id.value : null,
        motif: form.motif,
        detail: detail || null,
        contact_auteur: form.contactAuteur || null
      }
    })
    success.value = true
  } catch (e) {
    error.value = 'Une erreur est survenue : ' + (e as Error).message
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
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(239,68,68,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-3xl mx-auto px-6">
        <NuxtLink :to="retour" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← {{ id ? 'Retour à la fiche' : 'Retour à l\'annuaire' }}
        </NuxtLink>
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Signaler une erreur</h1>
        <p class="text-gray-500 text-lg max-w-2xl">Aidez-nous à maintenir l'annuaire à jour en signalant les informations incorrectes.</p>
      </div>
    </section>

    <!-- SUCCÈS -->
    <section v-if="success" class="bg-gray-50 py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">{{ demandeRetrait ? 'Demande de retrait enregistrée' : 'Signalement envoyé' }}</h2>
        <p class="text-gray-500 mb-8">
          {{ demandeRetrait
            ? 'Votre fiche sera retirée dans les meilleurs délais, et au plus tard sous un mois. Vous pouvez écrire à annuaire.tsa@gmail.com si vous souhaitez une confirmation.'
            : 'Merci pour votre contribution. La fiche sera vérifiée rapidement.' }}
        </p>
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

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-base">🚩</span>
            {{ demandeCorrection ? 'Votre demande de correction' : 'Détails du signalement' }}
          </h2>

          <div class="space-y-5">
            <div>
              <label for="motif" class="block text-sm font-semibold text-gray-700 mb-1.5">Motif *</label>
              <select id="motif" v-model="form.motif" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all">
                <option value="">— Choisir un motif —</option>
                <option v-for="m in motifs" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <div v-if="demandeRetrait" class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-900 leading-relaxed">
              Votre fiche sera retirée dans les meilleurs délais, et au plus tard sous un
              mois, sans que vous ayez à vous justifier. Aucune donnée vous concernant ne
              sera conservée.
              <br><br>
              Si vous préférez une confirmation écrite, écrivez plutôt à
              <a href="mailto:annuaire.tsa@gmail.com?subject=Retrait%20de%20ma%20fiche" class="font-semibold underline">annuaire.tsa@gmail.com</a>.
              <NuxtLink to="/donnees-praticiens" class="font-semibold underline">En savoir plus sur vos droits →</NuxtLink>
            </div>

            <div v-if="demandeCorrection" class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-900 leading-relaxed">
              Indiquez simplement ce qui doit changer et ce qu'il faut mettre à la place —
              tarif, adresse, public reçu, spécialités. Aucun justificatif ne vous sera
              demandé, et la correction est appliquée sous quelques jours.
              <br><br>
              Vous préférez écrire ?
              <a href="mailto:annuaire.tsa@gmail.com?subject=Correction%20de%20ma%20fiche" class="font-semibold underline">annuaire.tsa@gmail.com</a>
            </div>

            <!-- CORRECTION : par rubriques, avec la valeur actuelle en face.
                 Cocher une rubrique ouvre le champ qui doit la remplacer, et
                 l'envoi reste bloqué tant qu'il est vide : un signalement qui
                 dit ce qui est faux sans dire ce qu'il faut mettre à la place
                 n'est plus possible à produire. -->
            <div v-if="demandeCorrection">
              <span class="block text-sm font-semibold text-gray-700 mb-2">Qu'est-ce qui doit changer ? *</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="c in champsCorrigeables"
                  :key="c.cle"
                  type="button"
                  :aria-pressed="champsCoches.includes(c.cle)"
                  class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  :class="champsCoches.includes(c.cle)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
                  @click="basculerChamp(c.cle)"
                >{{ c.label }}</button>
              </div>

              <p v-if="!champsCoches.length" class="text-xs text-gray-500 mt-3 italic">
                Cochez au moins une rubrique — les champs à corriger apparaîtront ici.
              </p>

              <div v-else class="mt-4 space-y-3">
                <div v-for="cle in champsCoches" :key="cle" class="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p class="text-sm font-semibold text-indigo-900 mb-3">
                    {{ champsCorrigeables.find(c => c.cle === cle)?.label }}
                  </p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span class="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Actuellement sur la fiche</span>
                      <p class="bg-white border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 whitespace-pre-line">{{ valeurActuelle(cle) }}</p>
                    </div>
                    <div>
                      <label :for="`corr-${cle}`" class="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                        Nouvelle valeur <span class="text-red-600">*</span>
                      </label>
                      <textarea
                        :id="`corr-${cle}`"
                        v-model="corrections[cle]"
                        :rows="champsCorrigeables.find(c => c.cle === cle)?.lignes ?? 2"
                        placeholder="La bonne information…"
                        class="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white text-gray-900 resize-vertical"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <label for="details" class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Autre chose à signaler ? <span class="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <textarea id="details" v-model="form.details" rows="2" placeholder="Le contexte qu'aucune rubrique ci-dessus ne couvre." class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-gray-50 text-gray-900 resize-vertical transition-all" />
              </div>
            </div>

            <!-- AUTRES MOTIFS : le champ libre reste la bonne réponse. -->
            <div v-else>
              <label for="details" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Détails <span v-if="!demandeRetrait">*</span>
                <span v-else class="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <textarea id="details" v-model="form.details" rows="4" :placeholder="demandeRetrait ? 'Un mot si vous le souhaitez — ce n\'est pas nécessaire.' : 'Qu\'est-ce qui est inexact, et quelle est la bonne information ? Exemple : le téléphone est le 06 12 34 56 78, plus le 04…'" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-gray-50 text-gray-900 resize-vertical transition-all" />
            </div>
          </div>
        </div>

        <ChampContactAuteur v-model="form.contactAuteur" sujet="ce signalement" />

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="flex flex-wrap items-center justify-end gap-3">
            <!-- L'état est annoncé avant le clic, pas découvert après : c'est ce
                 qui rend la règle compréhensible plutôt que frustrante. -->
            <p v-if="demandeCorrection" class="text-sm mr-auto" :class="pretAEnvoyer ? 'text-emerald-700 font-medium' : 'text-gray-500'">
              <template v-if="!champsCoches.length">Cochez une rubrique pour pouvoir envoyer.</template>
              <template v-else-if="champsIncomplets.length">
                {{ champsIncomplets.length }}
                {{ champsIncomplets.length > 1 ? 'rubriques attendent' : 'rubrique attend' }}
                encore sa nouvelle valeur.
              </template>
              <template v-else>
                ✓ {{ champsCoches.length }}
                {{ champsCoches.length > 1 ? 'corrections prêtes' : 'correction prête' }} à envoyer.
              </template>
            </p>
            <NuxtLink :to="retour" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </NuxtLink>
            <button type="button" :disabled="loading" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors" @click="soumettre">
              {{ loading ? 'Envoi…' : 'Envoyer le signalement →' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
