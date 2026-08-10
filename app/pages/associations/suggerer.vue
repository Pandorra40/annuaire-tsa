<script setup lang="ts">
import { TYPES_ASSOCIATION } from '~/types/index'

useSeoMeta({
  title: 'Suggérer une association — Annuaire TSA',
  description: 'Vous animez ou connaissez une association spécialisée dans l\'autisme qui n\'apparaît pas encore dans l\'annuaire ? Signalez-la ici.'
})

const { suggererAssociation } = useApi()

const form = reactive({
  nom: '',
  type_association: '',
  ville: '',
  departement: '',
  adresse: '',
  telephone: '',
  email: '',
  site_web: '',
  services: '',
  age_public: '',
  description: '',
  hp: ''
})

const types = TYPES_ASSOCIATION

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function soumettre() {
  error.value = ''
  if (form.hp) return
  if (!form.nom || !form.ville || !form.departement) {
    error.value = 'Merci de renseigner au minimum le nom, la ville et le département.'
    return
  }
  loading.value = true
  try {
    await suggererAssociation({
      nom: form.nom,
      type_association: form.type_association || null,
      ville: form.ville,
      departement: form.departement,
      adresse: form.adresse || null,
      telephone: form.telephone || null,
      email: form.email || null,
      site_web: form.site_web || null,
      services: form.services || null,
      age_public: form.age_public || null,
      description: form.description || null,
      hp: form.hp
    })
    success.value = true
  } catch (e: any) {
    error.value = e?.data?.error ?? 'Une erreur est survenue : ' + e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>

    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-16" style="background: linear-gradient(160deg, #f0fdf4 0%, #f0f9ff 40%, #fdf4ff 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(74,222,128,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-3xl mx-auto px-6">
        <NuxtLink to="/associations" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Retour aux associations
        </NuxtLink>
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Suggérer une association</h1>
        <p class="text-gray-500 text-lg max-w-2xl leading-relaxed">
          Vous animez ou connaissez une association spécialisée dans l'autisme qui n'apparaît
          pas encore ici ? Le nom, la ville et le département suffisent.
        </p>
      </div>
    </section>

    <!-- SUCCÈS -->
    <section v-if="success" class="bg-gray-50 py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Suggestion envoyée !</h2>
        <p class="text-gray-500 mb-8 leading-relaxed">
          Merci. L'association sera examinée avant publication. Le site étant tenu par une
          seule personne, bénévolement, cela peut prendre quelques jours.
        </p>
        <NuxtLink to="/associations" class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
          ← Retour aux associations
        </NuxtLink>
      </div>
    </section>

    <!-- FORMULAIRE -->
    <section v-else class="bg-gray-50 min-h-screen py-12">
      <div class="max-w-3xl mx-auto px-6 space-y-5">

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          ⚠️ {{ error }}
        </div>

        <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
          ℹ️ Les informations soumises servent uniquement à alimenter l'annuaire. Les champs marqués * sont obligatoires.
        </div>

        <!-- IDENTITÉ -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">🤝</span>
            L'association
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="sm:col-span-2">
              <label for="nom" class="block text-sm font-semibold text-gray-700 mb-1.5">Nom *</label>
              <input id="nom" v-model="form.nom" type="text" placeholder="Nom de l'association" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div class="sm:col-span-2">
              <label for="type" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Type <span class="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <select id="type" v-model="form.type_association" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all">
                <option value="">— Choisir —</option>
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label for="ville" class="block text-sm font-semibold text-gray-700 mb-1.5">Ville *</label>
              <input id="ville" v-model="form.ville" type="text" placeholder="Lyon" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="departement" class="block text-sm font-semibold text-gray-700 mb-1.5">Département *</label>
              <input id="departement" v-model="form.departement" type="text" placeholder="69" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div class="sm:col-span-2">
              <label for="adresse" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse <span class="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <input id="adresse" v-model="form.adresse" type="text" placeholder="12 rue de la Paix" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
          </div>
        </div>

        <!-- CONTACT -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-base">📞</span>
            Comment la joindre
            <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="telephone" class="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
              <input id="telephone" v-model="form.telephone" type="tel" placeholder="01 23 45 67 89" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-1.5">Adresse électronique</label>
              <input id="email" v-model="form.email" type="email" placeholder="contact@association.fr" aria-describedby="email-aide" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
              <p id="email-aide" class="text-xs text-gray-500 mt-2">
                Celle de l'association, pas la vôtre : elle sera publiée sur sa fiche.
              </p>
            </div>
            <div class="sm:col-span-2">
              <label for="site_web" class="block text-sm font-semibold text-gray-700 mb-1.5">Site web</label>
              <input id="site_web" v-model="form.site_web" type="url" placeholder="https://…" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
          </div>
        </div>

        <!-- CE QU'ELLE PROPOSE -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <span class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-base">📝</span>
            Ce qu'elle propose
            <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
          </h2>
          <div class="space-y-5">
            <div>
              <label for="services" class="block text-sm font-semibold text-gray-700 mb-1.5">Services</label>
              <input id="services" v-model="form.services" type="text" placeholder="Groupes de parole, guidance parentale, activités…" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="age_public" class="block text-sm font-semibold text-gray-700 mb-1.5">Public concerné</label>
              <input id="age_public" v-model="form.age_public" type="text" placeholder="Enfants, adolescents, adultes, familles…" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label for="description" class="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea id="description" v-model="form.description" rows="4" placeholder="En quelques lignes, ce que fait l'association et ce qu'elle apporte aux familles." class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 resize-vertical transition-all" />
            </div>
          </div>
        </div>

        <input v-model="form.hp" type="text" name="email_confirm" autocomplete="off" aria-hidden="true" style="display:none" tabindex="-1" />

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="flex justify-end gap-3">
            <NuxtLink to="/associations" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
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
