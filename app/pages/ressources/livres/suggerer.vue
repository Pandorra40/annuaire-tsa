<script setup lang="ts">
useSeoMeta({
  title: 'Suggérer un livre — Livres TSA',
  description: 'Signalez un livre sur le TSA qui mériterait d\'apparaître dans la sélection.'
})

const { suggererLivre } = useApi()

const form = reactive({
  titre: '',
  auteur: '',
  annee: '',
  categorie: '',
  description: '',
  lien: '',
  contactAuteur: '',
  hp: ''
})

const categories = ['témoignage', 'guide pratique', 'scientifique', 'jeunesse', 'roman']

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function soumettre() {
  error.value = ''
  if (form.hp) return
  if (!form.titre || !form.auteur) {
    error.value = 'Merci de renseigner au minimum le titre et l\'auteur.'
    return
  }
  loading.value = true
  try {
    await suggererLivre({
      titre: form.titre,
      auteur: form.auteur,
      annee: form.annee ? parseInt(form.annee) : null,
      categorie: form.categorie || null,
      description: form.description || null,
      lien: form.lien || null,
      contact_auteur: form.contactAuteur || null
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
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-3xl mx-auto px-6">
        <NuxtLink to="/ressources/livres" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Retour aux livres
        </NuxtLink>
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Suggérer un livre</h1>
        <p class="text-gray-500 text-lg max-w-2xl">Vous connaissez un livre sur le TSA qui mériterait d'apparaître ici ? Titre et auteur suffisent.</p>
      </div>
    </section>

    <!-- SUCCÈS -->
    <section v-if="success" class="bg-gray-50 py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Suggestion envoyée !</h2>
        <p class="text-gray-500 mb-8">Merci. Le livre sera examiné avant publication.</p>
        <NuxtLink to="/ressources/livres" class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
          ← Retour aux livres
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
            <span class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-base">📚</span>
            Le livre
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="titre" class="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
              <input id="titre" v-model="form.titre" type="text" placeholder="Le titre du livre" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="auteur" class="block text-sm font-semibold text-gray-700 mb-1.5">Auteur *</label>
              <input id="auteur" v-model="form.auteur" type="text" placeholder="Prénom Nom" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="annee" class="block text-sm font-semibold text-gray-700 mb-1.5">Année <span class="text-gray-500 font-normal">(optionnel)</span></label>
              <input id="annee" v-model="form.annee" type="number" placeholder="2024" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="categorie" class="block text-sm font-semibold text-gray-700 mb-1.5">Catégorie <span class="text-gray-500 font-normal">(optionnel)</span></label>
              <select id="categorie" v-model="form.categorie" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all capitalize">
                <option value="">— Choisir —</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-base">📝</span>
            Détails
            <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
          </h2>
          <div class="space-y-5">
            <div>
              <label for="description" class="block text-sm font-semibold text-gray-700 mb-1.5">Pourquoi ce livre ?</label>
              <textarea id="description" v-model="form.description" rows="3" placeholder="En quelques mots, pourquoi recommandez-vous ce livre ?" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 resize-vertical transition-all" />
            </div>
            <div>
              <label for="lien" class="block text-sm font-semibold text-gray-700 mb-1.5">Lien (Amazon, éditeur…)</label>
              <input id="lien" v-model="form.lien" type="url" placeholder="https://…" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
          </div>
        </div>

        <ChampContactAuteur v-model="form.contactAuteur" sujet="cette suggestion" />

        <input v-model="form.hp" type="text" name="email_confirm" autocomplete="off" aria-hidden="true" style="display:none" tabindex="-1" />

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="flex justify-end gap-3">
            <NuxtLink to="/ressources/livres" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </NuxtLink>
            <button type="button" :disabled="loading" class="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors" @click="soumettre">
              {{ loading ? 'Envoi…' : 'Envoyer la suggestion →' }}
            </button>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>
