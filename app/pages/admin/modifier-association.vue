<script setup lang="ts">
import { TYPES_ASSOCIATION } from '~/types/index'
import type { Association } from '~/types/index'
import { normaliserUrl } from '~/utils/url'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Modifier une association — Administration TSA' })

const route = useRoute()
const { adminFetch } = useAdminAuth()
const associationId = route.query.id as string
const loading = ref(true)
const success = ref(false)
const erreur = ref('')
const notice = ref('')

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
  description: ''
})

const types = TYPES_ASSOCIATION

onMounted(() => {
  void chargerFiche()
})

async function chargerFiche() {
  if (!associationId) {
    erreur.value = 'Aucune association spécifiée.'
    loading.value = false
    return
  }
  try {
    const data = await adminFetch<Association>('admin-associations?id=' + associationId)
    if (!data?.id) {
      erreur.value = 'Fiche introuvable.'
      loading.value = false
      return
    }
    form.nom = data.nom || ''
    form.type_association = data.type_association || ''
    form.ville = data.ville || ''
    form.departement = data.departement || ''
    form.adresse = data.adresse || ''
    form.telephone = data.telephone || ''
    form.email = data.email || ''
    form.site_web = data.site_web || ''
    form.services = data.services || ''
    form.age_public = data.age_public || ''
    form.description = data.description || ''
  } catch (e) {
    erreur.value = 'Erreur : ' + (e as Error).message
  } finally {
    loading.value = false
  }
}

async function sauvegarder() {
  notice.value = ''
  if (!form.nom || !form.ville || !form.departement) {
    notice.value = 'Merci de renseigner : nom, ville et département.'
    return
  }
  const siteWeb = normaliserUrl(form.site_web)
  if (siteWeb) form.site_web = siteWeb
  try {
    await adminFetch('admin-associations?id=' + associationId, {
      method: 'PATCH',
      body: JSON.stringify({
        nom: form.nom,
        type_association: form.type_association || null,
        ville: form.ville,
        departement: form.departement,
        adresse: form.adresse || null,
        telephone: form.telephone || null,
        email: form.email || null,
        site_web: siteWeb || null,
        services: form.services || null,
        age_public: form.age_public || null,
        description: form.description || null
      })
    })
    success.value = true
    window.scrollTo(0, 0)
  } catch (e) {
    const err = e as { data?: { error?: string }, message?: string }
    notice.value = err?.data?.error ?? 'Une erreur est survenue : ' + (err.message ?? '')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/admin/associations" class="flex items-center gap-2 font-bold text-gray-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Associations
        </NuxtLink>
      </div>
    </header>

    <div class="max-w-3xl mx-auto px-4 py-6">
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">Modifier une association</h1>
        <p class="text-sm text-gray-500 mt-1">Les modifications sont visibles immédiatement sur le site.</p>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin text-gray-400 w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>

      <div v-else-if="erreur" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{{ erreur }}</div>

      <div v-else-if="success" class="text-center py-16">
        <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 class="text-lg font-semibold mb-2">Fiche mise à jour !</h2>
        <p class="text-gray-500 text-sm mb-6">Les modifications sont visibles immédiatement.</p>
        <div class="flex justify-center gap-3">
          <NuxtLink to="/admin/associations" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">← Retour aux associations</NuxtLink>
          <NuxtLink :to="`/association/${associationId}`" target="_blank" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Voir la fiche ↗</NuxtLink>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div v-if="notice" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{{ notice }}</div>

        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Identité</h2>
          <div class="space-y-4">
            <UFormField label="Nom *">
              <UInput v-model="form.nom" />
            </UFormField>
            <UFormField label="Type">
              <select v-model="form.type_association" aria-label="Type d'association" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
                <option value="">— Non renseigné —</option>
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Localisation</h2>
          <div class="space-y-4">
            <UFormField label="Adresse">
              <UInput v-model="form.adresse" />
            </UFormField>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Ville *">
                <UInput v-model="form.ville" />
              </UFormField>
              <UFormField label="Département *">
                <UInput v-model="form.departement" placeholder="33" />
              </UFormField>
            </div>
          </div>
        </UCard>

        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Contact</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Téléphone">
              <UInput v-model="form.telephone" type="tel" />
            </UFormField>
            <UFormField label="Email (publié)">
              <UInput v-model="form.email" type="email" />
            </UFormField>
            <UFormField label="Site web" class="sm:col-span-2">
              <UInput v-model="form.site_web" type="text" inputmode="url" placeholder="www.association.fr" />
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Ce qu'elle propose</h2>
          <div class="space-y-4">
            <UFormField label="Services">
              <UInput v-model="form.services" />
            </UFormField>
            <UFormField label="Public concerné">
              <UTextarea v-model="form.age_public" :rows="3" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="form.description" :rows="4" />
            </UFormField>
          </div>
        </UCard>

        <div class="flex justify-end gap-3 pt-2">
          <NuxtLink to="/admin/associations" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Annuler</NuxtLink>
          <button type="button" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors" @click="sauvegarder">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
