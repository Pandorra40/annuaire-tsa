<script setup lang="ts">
import type { Association, SuggestionAssociation } from '~/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Associations — Administration TSA' })

const token = ref('')
const suggestions = ref<SuggestionAssociation[]>([])
const publiees = ref<Association[]>([])
const activeTab = ref('suggestions')
const search = ref('')
const loading = ref(true)
const loadError = ref('')

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
    const [s, p] = await Promise.all([
      adminFetch('suggestions_associations.php?statut=en_attente'),
      adminFetch('associations.php')
    ])
    suggestions.value = s
    publiees.value = p
  } catch (e) {
    loadError.value = 'Erreur de chargement : ' + ((e as Error).message ?? 'inconnue')
  } finally {
    loading.value = false
  }
}

const publieesFiltrees = computed(() => {
  const q = search.value.toLowerCase().trim()
  return q ? publiees.value.filter(a => `${a.nom} ${a.ville} ${a.departement}`.toLowerCase().includes(q)) : publiees.value
})

let enCours = false

async function statuer(id: number, statut: 'valide' | 'refuse') {
  if (enCours) return
  if (statut === 'refuse' && !confirm('Refuser cette suggestion ?')) return
  enCours = true
  try {
    await adminFetch('suggestions_associations.php?id=' + id, {
      method: 'PATCH',
      body: JSON.stringify({ statut })
    })
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
          <h1 class="font-bold text-gray-900">🤝 Associations TSA</h1>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/admin" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Admin Annuaire</NuxtLink>
          <NuxtLink to="/associations" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Voir le site</NuxtLink>
          <button type="button" class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors" @click="deconnexion">Déconnexion</button>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">

      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">⚠️ {{ loadError }}</div>

      <div class="flex gap-1 border-b border-gray-200 mb-6">
        <button type="button"
          v-for="tab in [
            { id: 'suggestions', label: 'Suggestions', count: suggestions.length },
            { id: 'publiees', label: 'Publiées', count: publiees.length }
          ]"
          :key="tab.id"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
          :class="activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full" :class="tab.id === 'suggestions' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'">{{ tab.count }}</span>
        </button>
      </div>

      <!-- SUGGESTIONS -->
      <div v-if="activeTab === 'suggestions'">
        <div v-if="loading" class="text-center py-12 text-gray-500">Chargement…</div>
        <div v-else-if="!suggestions.length" class="text-center py-12 text-gray-500">Aucune suggestion en attente.</div>
        <div v-else class="space-y-3">
          <UCard v-for="s in suggestions" :key="s.id">
            <div class="font-bold text-gray-900">{{ s.nom }}</div>
            <div class="text-sm text-gray-500">
              {{ s.ville }} ({{ s.departement }}){{ s.type_association ? ' · ' + s.type_association : '' }}
            </div>
            <div v-if="s.adresse" class="text-xs text-gray-500 mt-1">{{ s.adresse }}</div>
            <div class="text-xs text-gray-500 mt-1">
              <span v-if="s.telephone">{{ s.telephone }}</span>
              <span v-if="s.telephone && s.email"> · </span>
              <span v-if="s.email">{{ s.email }}</span>
            </div>
            <div v-if="s.site_web" class="text-xs mt-1">
              <a :href="s.site_web" target="_blank" rel="noopener" class="text-blue-600 hover:underline break-all">{{ s.site_web }}</a>
            </div>
            <div v-if="s.services" class="text-xs text-gray-500 mt-2"><strong>Services :</strong> {{ s.services }}</div>
            <div v-if="s.age_public" class="text-xs text-gray-500 mt-1"><strong>Public :</strong> {{ s.age_public }}</div>
            <div v-if="s.description" class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded whitespace-pre-line">{{ s.description }}</div>
            <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button type="button" class="px-3 py-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors" @click="statuer(s.id, 'valide')">Valider → Publier</button>
              <button type="button" class="px-3 py-1.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="statuer(s.id, 'refuse')">Refuser</button>
            </div>
          </UCard>
        </div>
      </div>

      <!-- PUBLIÉES -->
      <div v-if="activeTab === 'publiees'">
        <UInput v-model="search" placeholder="Rechercher une association…" class="mb-4 max-w-md" />
        <div v-if="loading" class="text-center py-12 text-gray-500">Chargement…</div>
        <div v-else-if="!publieesFiltrees.length" class="text-center py-12 text-gray-500">Aucune association.</div>
        <div v-else class="space-y-3">
          <UCard v-for="a in publieesFiltrees" :key="a.id">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-bold text-gray-900">{{ a.nom }}</div>
                <div class="text-sm text-gray-500">{{ a.ville }} ({{ a.departement }})</div>
                <div v-if="a.services" class="text-xs text-gray-500 mt-1">{{ a.services }}</div>
              </div>
              <UBadge v-if="a.type_association" color="neutral" variant="soft" size="xs">{{ a.type_association }}</UBadge>
            </div>
          </UCard>
        </div>
        <!-- La modification et la suppression d'une association publiée passent encore
             par phpMyAdmin : cet écran ne sert qu'à modérer les suggestions et à
             vérifier ce qui est en ligne. -->
        <p class="text-xs text-gray-400 mt-4">
          Modification et suppression via phpMyAdmin : cette page ne fait que la modération.
        </p>
      </div>

    </div>
  </div>
</template>
