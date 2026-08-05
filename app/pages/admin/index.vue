<script setup lang="ts">
import { MOTIF_RETRAIT } from '~/types/index'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Administration — Annuaire TSA' })

const token = ref('')
const fiches = ref<any[]>([])
const attente = ref<any[]>([])
const signalements = ref<any[]>([])
const activeTab = ref('attente')
const searchPublies = ref('')
const loading = ref(true)
const loadError = ref('')
const SEUIL = 3

onMounted(async () => {
  token.value = sessionStorage.getItem('admin_token') || ''
  if (!token.value) { navigateTo('/admin/login'); return }
  activeTab.value = sessionStorage.getItem('admin_tab') || 'attente'
  await charger()
})

async function adminFetch(url: string, options: any = {}) {
  const res = await fetch('/api/' + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token.value, ...options.headers }
  })
  if (res.status === 401) { navigateTo('/admin/login'); throw new Error('Non authentifié') }
  if (!res.ok) throw new Error('Erreur ' + res.status)
  return res.json()
}

async function charger() {
  loading.value = true
  try {
    const [p, a, s] = await Promise.all([
      adminFetch('admin_praticiens.php'),
      adminFetch('suggestions.php?statut=en_attente'),
      adminFetch('signalements.php?statut=ouvert')
    ])
    fiches.value = p
    attente.value = a
    signalements.value = s
  } catch (e: any) {
    loadError.value = 'Erreur de chargement : ' + (e.message ?? 'inconnue')
  } finally { loading.value = false }
}

const publies = computed(() => fiches.value.filter(p => p.statut === 'publie'))
const masquees = computed(() => fiches.value.filter(p => p.statut !== 'publie'))

const alertes = computed(() =>
  publies.value.filter(p => nbSignalements(p.id) >= SEUIL)
)

const publiesFiltres = computed(() => {
  const q = searchPublies.value.toLowerCase()
  return q ? publies.value.filter(p => p.nom.toLowerCase().includes(q) || p.ville.toLowerCase().includes(q)) : publies.value
})

function nbSignalements(id: number) {
  return signalements.value.filter(s => s.praticien_id === id).length
}

function setTab(tab: string) {
  activeTab.value = tab
  sessionStorage.setItem('admin_tab', tab)
}

let enCours = false

async function valider(id: number) {
  if (enCours) return; enCours = true
  try { await adminFetch('suggestions.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'valide' }) }); await charger() }
  catch (e: any) { alert('Erreur : ' + (e as Error).message) }
  finally { enCours = false }
}

async function refuser(id: number) {
  if (enCours) return; enCours = true
  try { await adminFetch('suggestions.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'refuse' }) }); await charger() }
  catch (e: any) { alert('Erreur : ' + (e as Error).message) }
  finally { enCours = false }
}

async function supprimer(id: number) {
  if (enCours) return
  if (!confirm('Supprimer définitivement ce praticien ? Cette action est irréversible.')) return
  enCours = true
  try { await adminFetch('admin_praticiens.php?id=' + id, { method: 'DELETE' }); await charger() }
  catch (e: any) { alert('Erreur : ' + (e as Error).message) }
  finally { enCours = false }
}

async function basculerVisibilite(id: number, statut: string) {
  if (enCours) return; enCours = true
  try { await adminFetch('admin_praticiens.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut }) }); await charger() }
  catch (e: any) { alert('Erreur : ' + (e as Error).message) }
  finally { enCours = false }
}

async function ignorerSignalement(id: number) {
  if (enCours) return; enCours = true
  try { await adminFetch('signalements.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'ignore' }) }); await charger() }
  catch (e: any) { alert('Erreur : ' + (e as Error).message) }
  finally { enCours = false }
}

async function deconnexion() {
  try { await adminFetch('auth.php', { method: 'DELETE' }) } catch {}
  sessionStorage.removeItem('admin_token')
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- NAVBAR ADMIN -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo-tsa.svg" alt="" class="h-6 w-auto" />
          <span class="font-bold text-gray-900">Administration</span>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/admin/contacts" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            ✉️ Contacts
          </NuxtLink>
          <NuxtLink to="/admin/livres" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            📚 Livres
          </NuxtLink>
          <NuxtLink to="/" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Voir le site
          </NuxtLink>
          <button
            class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            @click="deconnexion"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">

      <!-- STATS -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <UCard v-for="stat in [
          { val: publies.length, label: 'Praticiens publiés', color: 'text-blue-600' },
          { val: masquees.length, label: 'Fiches en pause', color: 'text-gray-600' },
          { val: attente.length, label: 'En attente', color: 'text-amber-600' },
          { val: signalements.length, label: 'Signalements', color: 'text-red-600' },
          { val: alertes.length, label: 'Alertes', color: 'text-red-700' }
        ]" :key="stat.label">
          <div :class="['text-2xl font-bold', stat.color]">{{ stat.val }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
        </UCard>
      </div>

      <!-- ERREUR CHARGEMENT -->
      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">⚠️ {{ loadError }}</div>

      <!-- CHARGEMENT -->
      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin text-gray-400 w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>

      <template v-else>
        <!-- ONGLETS -->
        <div class="flex gap-1 border-b border-gray-200 mb-6">
          <button
            v-for="tab in [
              { id: 'attente', label: 'En attente', count: attente.length },
              { id: 'publies', label: 'Publiés', count: null },
              { id: 'masquees', label: 'En pause', count: masquees.length },
              { id: 'signalements', label: 'Signalements', count: signalements.length },
              { id: 'alertes', label: 'Alertes', count: alertes.length }
            ]"
            :key="tab.id"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
            :class="activeTab === tab.id
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="setTab(tab.id)"
          >
            {{ tab.label }}
            <span v-if="tab.count" class="ml-1.5 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">{{ tab.count }}</span>
          </button>
        </div>

        <!-- EN ATTENTE -->
        <div v-if="activeTab === 'attente'">
          <div v-if="!attente.length" class="text-center py-12 text-gray-400">Aucune fiche en attente.</div>
          <div v-else class="space-y-3">
            <UCard v-for="d in attente" :key="d.id">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="font-bold text-gray-900">{{ d.nom }}</div>
                  <div class="text-sm text-gray-500">{{ d.type }} · {{ d.ville }} ({{ d.departement }})</div>
                  <div v-if="d.adeli" class="text-xs text-gray-400 mt-1">ADELI/RPPS : {{ d.adeli }}</div>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <UBadge v-for="age in d.ages" :key="age" color="primary" variant="soft" size="xs">{{ age }}</UBadge>
                    <UBadge v-if="d.teleconsultation" color="success" variant="soft" size="xs">Téléconsultation</UBadge>
                  </div>
                  <div v-if="d.telephone" class="text-sm text-blue-600 mt-2">☎ {{ d.telephone }}</div>
                  <div v-if="d.notes" class="prose prose-sm text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded" v-html="d.notes" />
                </div>
                <UBadge color="neutral" variant="soft" size="xs">{{ d.source === 'praticien' ? 'Auto-déclaré' : 'Communauté' }}</UBadge>
              </div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button class="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors" @click="valider(d.id)">Valider</button>
                <button class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="refuser(d.id)">Refuser</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- PUBLIÉS -->
        <div v-if="activeTab === 'publies'">
          <UInput v-model="searchPublies" placeholder="Rechercher un praticien publié…" icon="i-lucide-search" class="mb-4 max-w-md" />
          <div v-if="!publiesFiltres.length" class="text-center py-12 text-gray-400">Aucun résultat.</div>
          <div v-else class="space-y-3">
            <UCard v-for="d in publiesFiltres" :key="d.id">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="font-bold text-gray-900">{{ d.nom }}</div>
                  <div class="text-sm text-gray-500">{{ d.type }} · {{ d.ville }} ({{ d.departement }})</div>
                  <div class="flex gap-3 mt-2 text-xs text-gray-400">
                    <span class="text-green-600">✓ {{ d.confirmations || 0 }} confirmation{{ (d.confirmations || 0) > 1 ? 's' : '' }}</span>
                    <span v-if="nbSignalements(d.id) > 0" class="text-red-600">⚠ {{ nbSignalements(d.id) }} signalement{{ nbSignalements(d.id) > 1 ? 's' : '' }}</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <NuxtLink :to="`/admin/modifier?id=${d.id}`" class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Modifier</NuxtLink>
                <button class="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors" @click="basculerVisibilite(d.id, 'masquee')">Mettre en pause</button>
                <button class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(d.id)">Supprimer</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- EN PAUSE -->
        <div v-if="activeTab === 'masquees'">
          <div v-if="!masquees.length" class="text-center py-12 text-gray-400">Aucune fiche en pause.</div>
          <div v-else class="space-y-3">
            <p class="text-sm text-gray-500 mb-4">
              Ces fiches n'apparaissent ni dans l'annuaire, ni dans les pages département,
              ni dans le plan du site. Aucune donnée n'a été perdue.
            </p>
            <UCard v-for="d in masquees" :key="d.id" class="opacity-75">
              <div class="font-bold text-gray-900">{{ d.nom }}</div>
              <div class="text-sm text-gray-500">{{ d.type }} · {{ d.ville }} ({{ d.departement }})</div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                <button class="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors" @click="basculerVisibilite(d.id, 'publie')">Remettre en ligne</button>
                <NuxtLink :to="`/admin/modifier?id=${d.id}`" class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Modifier</NuxtLink>
                <button class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(d.id)">Supprimer</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- SIGNALEMENTS -->
        <div v-if="activeTab === 'signalements'">
          <div v-if="!signalements.length" class="text-center py-12 text-gray-400">Aucun signalement en cours.</div>
          <div v-else class="space-y-3">
            <UCard v-for="s in signalements" :key="s.id" :class="s.motif === MOTIF_RETRAIT ? 'ring-2 ring-red-400' : ''">
              <div v-if="s.motif === MOTIF_RETRAIT" class="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-semibold">
                ⚠ Demande de retrait par le praticien · délai légal : un mois maximum
              </div>
              <div class="font-bold text-gray-900">{{ s.praticien_nom || 'Praticien #' + s.praticien_id }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ s.motif }}</div>
              <div v-if="s.detail" class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">{{ s.detail }}</div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                <NuxtLink :to="`/admin/modifier?id=${s.praticien_id}`" class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Modifier la fiche</NuxtLink>
                <button v-if="s.motif === MOTIF_RETRAIT" class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(s.praticien_id)">Supprimer la fiche</button>
                <button class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors" @click="ignorerSignalement(s.id)">Ignorer</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- ALERTES -->
        <div v-if="activeTab === 'alertes'">
          <div v-if="!alertes.length" class="text-center py-12 text-gray-400">Aucune fiche en alerte.</div>
          <div v-else class="space-y-3">
            <UCard v-for="d in alertes" :key="d.id">
              <div class="font-bold text-gray-900">{{ d.nom }}</div>
              <div class="text-sm text-gray-500">{{ d.type }} · {{ d.ville }} ({{ d.departement }})</div>
              <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                ⚠ {{ nbSignalements(d.id) }} signalement{{ nbSignalements(d.id) > 1 ? 's' : '' }} reçu{{ nbSignalements(d.id) > 1 ? 's' : '' }} · vérification recommandée
              </div>
              <div v-if="d.confirmations > 0" class="mt-1 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                ✓ {{ d.confirmations }} confirmation{{ d.confirmations > 1 ? 's' : '' }} communautaire{{ d.confirmations > 1 ? 's' : '' }}
              </div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <NuxtLink :to="`/admin/modifier?id=${d.id}`" class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Modifier la fiche</NuxtLink>
                <button class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(d.id)">Supprimer</button>
              </div>
            </UCard>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>
