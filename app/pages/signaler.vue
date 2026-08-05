<script setup lang="ts">
import { MOTIF_RETRAIT } from '~/types/index'

useSeoMeta({
  title: 'Signaler une erreur — Annuaire TSA'
})

const route = useRoute()
const id = route.query.id as string
const config = useRuntimeConfig()

// Lien de retour : vers la fiche d'origine si on vient d'une fiche, sinon l'annuaire
const retour = computed(() => (id ? `/praticien/${id}` : '/'))

const form = reactive({
  motif: '',
  details: ''
})

const motifs = [
  MOTIF_RETRAIT,
  'Informations incorrectes (adresse, téléphone…)',
  'Praticien n\'exerce plus',
  'Praticien n\'est pas spécialisé TSA',
  'Cabinet fermé',
  'Doublon',
  'Autre'
]

const demandeRetrait = computed(() => form.motif === MOTIF_RETRAIT)

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function soumettre() {
  error.value = ''
  if (!form.motif) {
    error.value = 'Merci de sélectionner un motif.'
    return
  }
  // Un signalement sans explication n'est pas exploitable : il faut réécrire au praticien
  // pour savoir quoi corriger. Seule la demande de retrait en est dispensée — exiger une
  // justification pour une opposition serait contraire à l'article 21 du RGPD.
  if (!demandeRetrait.value && form.details.trim().length < 10) {
    error.value = 'Merci de décrire ce qui est inexact, et si possible la bonne information.'
    return
  }
  loading.value = true
  try {
    await $fetch(`${config.public.apiBase}/signalements.php`, {
      method: 'POST',
      body: { praticien_id: id, motif: form.motif, detail: form.details || null }
    })
    success.value = true
  } catch (e: any) {
    error.value = 'Une erreur est survenue : ' + e.message
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
            <div class="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-base">🚩</div>
            Détails du signalement
          </h2>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Motif *</label>
              <select v-model="form.motif" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all">
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

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                Détails <span v-if="!demandeRetrait">*</span>
                <span v-else class="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea v-model="form.details" rows="4" :placeholder="demandeRetrait ? 'Un mot si vous le souhaitez — ce n\'est pas nécessaire.' : 'Qu\'est-ce qui est inexact, et quelle est la bonne information ? Exemple : le téléphone est le 06 12 34 56 78, plus le 04…'" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-gray-50 text-gray-900 resize-vertical transition-all" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="flex justify-end gap-3">
            <NuxtLink :to="retour" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </NuxtLink>
            <button :disabled="loading" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors" @click="soumettre">
              {{ loading ? 'Envoi…' : 'Envoyer le signalement →' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
