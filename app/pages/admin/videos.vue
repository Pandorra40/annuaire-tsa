<script setup lang="ts">
import { CATEGORIES_VIDEOS } from '~/types/index'
import type { Video } from '~/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Vidéos — Administration TSA' })

const token = ref('')
const entrees = ref<Video[]>([])
const activeTab = ref('ajouter')
const search = ref('')
const loading = ref(true)
const loadError = ref('')
const notice = ref({ msg: '', type: '' })

const form = reactive({
  adresse: '', titre: '', chaine: '', categorie: '', duree: '', pourquoi: ''
})

// Reconnaissance côté navigateur, uniquement pour guider la saisie : le serveur
// refait le travail et fait seul autorité.
const natureSaisie = computed(() => {
  const a = form.adresse.trim()
  if (!a) return ''
  if (/youtu\.be\/|[?&]v=|\/shorts\/|\/embed\//.test(a)) return 'video'
  if (/youtube\.com\/(@|channel\/|c\/|user\/)/.test(a)) return 'chaine'
  return 'inconnu'
})

onMounted(async () => {
  token.value = sessionStorage.getItem('admin_token') || ''
  if (!token.value) {
    navigateTo('/admin/login')
    return
  }
  await charger()
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
  if (!res.ok) {
    const corps = await res.json().catch(() => ({}))
    throw new Error(corps.error ?? 'Erreur ' + res.status)
  }
  if (res.status === 204) return {}
  return res.json()
}

async function charger() {
  loading.value = true
  try {
    entrees.value = await adminFetch('videos.php')
  } catch (e) {
    loadError.value = 'Erreur de chargement : ' + ((e as Error).message ?? 'inconnue')
  } finally {
    loading.value = false
  }
}

const entreesFiltrees = computed(() => {
  const q = search.value.toLowerCase().trim()
  return q ? entrees.value.filter(e => `${e.titre} ${e.chaine}`.toLowerCase().includes(q)) : entrees.value
})

function reinitialiser() {
  Object.assign(form, { adresse: '', titre: '', chaine: '', categorie: '', duree: '', pourquoi: '' })
}

async function ajouter() {
  notice.value = { msg: '', type: '' }
  if (!form.adresse || !form.titre || !form.chaine || !form.categorie || !form.pourquoi) {
    notice.value = { msg: 'Adresse, titre, chaîne, catégorie et « pourquoi ici » sont obligatoires.', type: 'error' }
    return
  }
  try {
    await adminFetch('videos.php', { method: 'POST', body: JSON.stringify({ ...form }) })
    notice.value = { msg: '✓ Entrée publiée.', type: 'success' }
    reinitialiser()
    await charger()
  } catch (e) {
    notice.value = { msg: (e as Error).message, type: 'error' }
  }
}

let enCours = false
async function supprimer(id: number) {
  if (enCours) return
  if (!confirm('Supprimer cette entrée ? Cette action est irréversible.')) return
  enCours = true
  try {
    await adminFetch('videos.php?id=' + id, { method: 'DELETE' })
    await charger()
  } catch (e) {
    alert('Erreur : ' + (e as Error).message)
  } finally {
    enCours = false
  }
}

async function deconnexion() {
  try {
    await adminFetch('auth.php', { method: 'DELETE' })
  } catch {
    // déconnexion locale malgré tout : le jeton côté serveur expirera de lui-même
  }
  sessionStorage.removeItem('admin_token')
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo-tsa.svg" alt="" class="h-6 w-auto" />
          <h1 class="font-bold text-gray-900">🎬 Vidéos TSA</h1>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/admin" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Admin Annuaire</NuxtLink>
          <NuxtLink to="/admin/livres" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Livres</NuxtLink>
          <NuxtLink to="/ressources/videos" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Voir le site</NuxtLink>
          <button type="button" class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors" @click="deconnexion">Déconnexion</button>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">

      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">⚠️ {{ loadError }}</div>

      <div class="flex gap-1 border-b border-gray-200 mb-6">
        <button type="button"
          v-for="tab in [{ id: 'ajouter', label: 'Ajouter', count: undefined }, { id: 'publies', label: 'Publiés', count: entrees.length }]"
          :key="tab.id"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
          :class="activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">{{ tab.count }}</span>
        </button>
      </div>

      <!-- AJOUTER -->
      <div v-if="activeTab === 'ajouter'">
        <UCard class="max-w-2xl">
          <h2 class="font-semibold text-gray-900 mb-4">Nouvelle entrée</h2>

          <div v-if="notice.msg" :class="['p-3 rounded-lg text-sm mb-4', notice.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700']">
            {{ notice.msg }}
          </div>

          <div class="space-y-4">
            <UFormField label="Adresse YouTube *" help="Une vidéo (youtu.be/…, watch?v=…, /shorts/…) ou une chaîne (youtube.com/@nom).">
              <UInput v-model="form.adresse" placeholder="https://…" />
            </UFormField>

            <p v-if="natureSaisie === 'video'" class="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg p-2.5">
              Reconnu comme une <strong>vidéo</strong> : elle sera lisible sur place, après clic.
            </p>
            <p v-else-if="natureSaisie === 'chaine'" class="text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-lg p-2.5">
              Reconnu comme une <strong>chaîne</strong> : carte sans lecteur, avec un lien vers YouTube. La durée est inutile.
            </p>
            <p v-else-if="natureSaisie === 'inconnu'" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              Adresse non reconnue — le serveur la refusera.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Titre *"><UInput v-model="form.titre" placeholder="Titre de la vidéo ou de la chaîne" /></UFormField>
              <UFormField label="Chaîne / auteur *"><UInput v-model="form.chaine" placeholder="Nom de la chaîne" /></UFormField>
              <UFormField label="Catégorie *">
                <select v-model="form.categorie" aria-label="Catégorie" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
                  <option value="">— Choisir —</option>
                  <option v-for="c in CATEGORIES_VIDEOS" :key="c.id" :value="c.id">{{ c.label }}</option>
                </select>
              </UFormField>
              <UFormField label="Durée" help="Vidéos uniquement, saisie libre : « 14 min »."><UInput v-model="form.duree" placeholder="14 min" :disabled="natureSaisie === 'chaine'" /></UFormField>
            </div>

            <UFormField label="Pourquoi ici * " help="La phrase qui dit ce que cette ressource apporte. C'est elle qui distingue la rubrique d'une liste de liens.">
              <UTextarea v-model="form.pourquoi" placeholder="Explique le bilan sans jargon, utile avant un premier rendez-vous." />
            </UFormField>

            <div class="flex justify-end gap-3">
              <button type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="reinitialiser">Réinitialiser</button>
              <button type="button" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors" @click="ajouter">Publier</button>
            </div>
          </div>
        </UCard>
      </div>

      <!-- PUBLIÉS -->
      <div v-if="activeTab === 'publies'">
        <UInput v-model="search" placeholder="Rechercher une entrée…" class="mb-4 max-w-md" />
        <div v-if="loading" class="text-center py-12 text-gray-500">Chargement…</div>
        <div v-else-if="!entreesFiltrees.length" class="text-center py-12 text-gray-500">Aucune entrée publiée.</div>
        <div v-else class="space-y-3">
          <UCard v-for="e in entreesFiltrees" :key="e.id">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-bold text-gray-900">{{ e.titre }}</div>
                <div class="text-sm text-gray-500">{{ e.chaine }}{{ e.duree ? ' · ' + e.duree : '' }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ e.pourquoi }}</div>
                <a v-if="e.url" :href="e.url" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:underline break-all">{{ e.url }}</a>
                <div v-else-if="e.youtube_id" class="text-xs text-gray-400 mt-1">identifiant {{ e.youtube_id }}</div>
              </div>
              <UBadge color="neutral" variant="soft" size="xs">{{ e.type }}</UBadge>
            </div>
            <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button type="button" class="px-3 py-1.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(e.id)">Supprimer</button>
            </div>
          </UCard>
        </div>
      </div>

    </div>
  </div>
</template>
