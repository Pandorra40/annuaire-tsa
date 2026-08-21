<script setup lang="ts">
import { TYPES_PRATICIENS, AGES_OPTIONS } from '~/types/index'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Modifier une fiche — Administration TSA' })

const route = useRoute()
const praticienId = route.query.id as string
const token = ref('')
const loading = ref(true)
const success = ref(false)
const erreur = ref('')
const notice = ref('')

const form = reactive({
  nom: '', type: '', adresse: '', ville: '', departement: '',
  adresse2: '', ville2: '', departement2: '',
  telephone: '', site_web: '', teleconsultation: false,
  delai: '', ages: [] as string[], adeli: '',
  typesIntervention: '', bilans: '', formations: '', experience: '', modalites: '', tarifs: '', autresInfos: ''
})

const types = TYPES_PRATICIENS
const agesOptions = AGES_OPTIONS
const delais = ['', 'Disponible', 'Quelques semaines', '1 à 3 mois', '3 à 6 mois', 'Plus de 6 mois']

const secondLieuOuvert = ref(false)

// Mêmes sept rubriques et mêmes plafonds que le formulaire public — un seul
// endroit où ce gabarit est défini serait plus propre, mais suggerer.vue et
// modifier.vue ne partagent aucun composable aujourd'hui (déjà vrai avant
// cette bascule, pour l'éditeur Tiptap qu'elle remplace).
const RUBRIQUES = [
  { cle: 'typesIntervention', label: 'Types d\'intervention', max: 1500 },
  { cle: 'bilans', label: 'Bilans', max: 1000 },
  { cle: 'formations', label: 'Formations complémentaires', max: 1000 },
  { cle: 'experience', label: 'Expérience', max: 1500 },
  { cle: 'modalites', label: 'Modalités', max: 800 },
  { cle: 'tarifs', label: 'Tarifs', max: 500 },
  { cle: 'autresInfos', label: 'Autres informations', max: 2000 }
] as const

onMounted(async () => {
  token.value = sessionStorage.getItem('admin_token') || ''
  if (!token.value) {
    navigateTo('/admin/login')
    return
  }
  await chargerFiche()
})

async function adminFetch(url: string, options: RequestInit = {}) {
  const res = await fetch('/api/' + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token.value, ...options.headers }
  })
  if (res.status === 401) {
    navigateTo('/admin/login')
    throw new Error('Non authentifié')
  }
  if (!res.ok) throw new Error('Erreur ' + res.status)
  return res.json()
}

async function chargerFiche() {
  if (!praticienId) {
    erreur.value = 'Aucun praticien spécifié.'
    loading.value = false
    return
  }
  try {
    const data = await adminFetch('admin_praticiens.php?id=' + praticienId)
    if (!data?.id) {
      erreur.value = 'Fiche introuvable.'
      loading.value = false
      return
    }
    form.nom = data.nom || ''
    form.type = data.type || ''
    form.adresse = data.adresse || ''
    form.ville = data.ville || ''
    form.departement = data.departement || ''
    form.adresse2 = data.adresse2 || ''
    form.ville2 = data.ville2 || ''
    form.departement2 = data.departement2 || ''
    form.telephone = data.telephone || ''
    form.site_web = data.site_web || ''
    form.teleconsultation = !!data.teleconsultation
    form.delai = data.delai || ''
    form.ages = data.ages || []
    form.adeli = data.adeli || ''
    form.typesIntervention = data.types_intervention || ''
    form.bilans = data.bilans || ''
    form.formations = data.formations || ''
    form.experience = data.experience || ''
    form.modalites = data.modalites || ''
    form.tarifs = data.tarifs || ''
    form.autresInfos = data.autres_infos || ''
    // Pré-ouvert si la fiche a déjà un second lieu, pour que l'admin le voie
    // tout de suite plutôt que de devoir cliquer pour découvrir qu'il existe.
    secondLieuOuvert.value = !!(data.ville2 || data.departement2)
  } catch (e) {
    erreur.value = 'Erreur : ' + (e as Error).message
  } finally {
    loading.value = false
  }
}

function toggleAge(age: string) {
  const idx = form.ages.indexOf(age)
  if (idx === -1) form.ages.push(age)
  else form.ages.splice(idx, 1)
}

async function sauvegarder() {
  notice.value = ''
  if (!form.nom || !form.type || !form.ville || !form.departement || !form.ages.length) {
    notice.value = 'Merci de renseigner : nom, type, ville, département et public reçu.'
    return
  }
  try {
    await adminFetch('admin_praticiens.php?id=' + praticienId, {
      method: 'PATCH',
      body: JSON.stringify({
        nom: form.nom, type: form.type, ville: form.ville,
        departement: form.departement.substring(0, 2),
        adresse: form.adresse || null,
        ville2: secondLieuOuvert.value && form.ville2 ? form.ville2 : null,
        adresse2: secondLieuOuvert.value && form.adresse2 ? form.adresse2 : null,
        departement2: secondLieuOuvert.value && form.departement2 ? form.departement2.substring(0, 2) : null,
        telephone: form.telephone || null,
        site_web: form.site_web || null,
        teleconsultation: form.teleconsultation,
        delai: form.delai || null,
        types_intervention: form.typesIntervention || null,
        bilans: form.bilans || null,
        formations: form.formations || null,
        experience: form.experience || null,
        modalites: form.modalites || null,
        tarifs: form.tarifs || null,
        autres_infos: form.autresInfos || null,
        ages: form.ages,
        adeli: form.adeli || null
      })
    })
    success.value = true
    window.scrollTo(0, 0)
  } catch (e) {
    notice.value = 'Une erreur est survenue : ' + (e as Error).message
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- NAVBAR -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/admin" class="flex items-center gap-2 font-bold text-gray-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Administration
        </NuxtLink>
      </div>
    </header>

    <div class="max-w-3xl mx-auto px-4 py-6">

      <!-- En-tête -->
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">Modifier une fiche</h1>
        <p class="text-sm text-gray-500 mt-1">Les modifications sont visibles immédiatement sur l'annuaire.</p>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin text-gray-400 w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>

      <!-- Erreur -->
      <div v-else-if="erreur" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{{ erreur }}</div>

      <!-- Succès -->
      <div v-else-if="success" class="text-center py-16">
        <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 class="text-lg font-semibold mb-2">Fiche mise à jour !</h2>
        <p class="text-gray-500 text-sm mb-6">Les modifications sont visibles immédiatement.</p>
        <NuxtLink to="/admin" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">← Retour à l'admin</NuxtLink>
      </div>

      <!-- Formulaire -->
      <div v-else class="space-y-4">
        <div v-if="notice" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{{ notice }}</div>

        <!-- Identité -->
        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Identité</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Nom et prénom *">
              <UInput v-model="form.nom" />
            </UFormField>
            <UFormField label="Type de professionnel *">
              <select v-model="form.type" aria-label="Type de professionnel" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </UFormField>
          </div>
          <UFormField label="Numéro ADELI ou RPPS" class="mt-4">
            <UInput v-model="form.adeli" />
          </UFormField>
          <UFormField label="Public reçu *" class="mt-4">
            <div class="flex flex-wrap gap-3 mt-1">
              <label v-for="age in agesOptions" :key="age" class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" :checked="form.ages.includes(age)" @change="toggleAge(age)" class="rounded" />
                {{ age }}
              </label>
            </div>
          </UFormField>
        </UCard>

        <!-- Localisation -->
        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Localisation</h2>
          <UFormField label="Adresse" class="mb-4">
            <UInput v-model="form.adresse" />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Ville *">
              <UInput v-model="form.ville" />
            </UFormField>
            <UFormField label="Département *">
              <UInput v-model="form.departement" maxlength="5" />
            </UFormField>
          </div>

          <button v-if="!secondLieuOuvert" type="button" class="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors" @click="secondLieuOuvert = true">
            + Ajouter un second lieu
          </button>
          <div v-else class="mt-5 pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-semibold text-gray-700">Second lieu</p>
              <button type="button" class="text-xs text-gray-500 hover:text-gray-700 transition-colors" @click="secondLieuOuvert = false; form.ville2 = ''; form.adresse2 = ''; form.departement2 = ''">
                Retirer
              </button>
            </div>
            <UFormField label="Adresse" class="mb-4">
              <UInput v-model="form.adresse2" />
            </UFormField>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Ville">
                <UInput v-model="form.ville2" />
              </UFormField>
              <UFormField label="Département">
                <UInput v-model="form.departement2" maxlength="5" />
              </UFormField>
            </div>
          </div>
        </UCard>

        <!-- Contact & pratique -->
        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Contact & pratique</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <UFormField label="Téléphone">
              <UInput v-model="form.telephone" type="tel" />
            </UFormField>
            <UFormField label="Site web ou Doctolib">
              <UInput v-model="form.site_web" type="url" />
            </UFormField>
          </div>
          <UFormField label="Délai d'attente" class="mb-4">
            <select v-model="form.delai" aria-label="Délai d'attente" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
              <option value="">— Non renseigné —</option>
              <option v-for="d in delais.slice(1)" :key="d" :value="d">{{ d }}</option>
            </select>
          </UFormField>
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" v-model="form.teleconsultation" class="rounded" />
            Propose la téléconsultation
          </label>
        </UCard>

        <!-- Notes : sept champs texte simple plutôt qu'un éditeur riche —
             chaque rubrique guide sa propre saisie, le libellé du champ
             devient le libellé affiché sur la fiche publique. -->
        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Informations complémentaires</h2>
          <div class="space-y-4">
            <UFormField v-for="r in RUBRIQUES" :key="r.cle" :label="r.label">
              <template #description>{{ form[r.cle].length }} / {{ r.max }}</template>
              <UTextarea v-model="form[r.cle]" :rows="3" :maxlength="r.max" class="w-full" />
            </UFormField>
          </div>
        </UCard>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <NuxtLink to="/admin" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</NuxtLink>
          <button type="button" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors" @click="sauvegarder">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>
