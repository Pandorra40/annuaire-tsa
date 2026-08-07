<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Livres — Administration TSA' })

const token = ref('')
const publies = ref<any[]>([])
const suggestions = ref<any[]>([])
const activeTab = ref('ajouter')
const searchPublies = ref('')
const loading = ref(true)
const loadError = ref('')
const addNotice = ref({ msg: '', type: '' })

const form = reactive({
  titre: '', auteur: '', annee: '', categorie: '', type: 'classique', description: '', lien: ''
})

const categories = ['témoignage', 'guide pratique', 'scientifique', 'jeunesse', 'roman']

onMounted(async () => {
  token.value = sessionStorage.getItem('admin_token') || ''
  if (!token.value) { navigateTo('/admin/login'); return }
  await charger()
})

async function adminFetch(url: string, options: any = {}) {
  const res = await fetch('/api/' + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token.value, ...options.headers }
  })
  if (res.status === 401) { navigateTo('/admin/login'); throw new Error('Non authentifié') }
  if (!res.ok) throw new Error('Erreur ' + res.status)
  if (res.status === 204) return {}
  return res.json()
}

async function charger() {
  loading.value = true
  try {
    const [p, s] = await Promise.all([
      adminFetch('livres.php'),
      adminFetch('suggestions_livres.php?statut=en_attente')
    ])
    publies.value = p
    suggestions.value = s
  } catch (e: any) {
    loadError.value = 'Erreur de chargement : ' + (e.message ?? 'inconnue')
  } finally { loading.value = false }
}

const publiesFiltres = computed(() => {
  const q = searchPublies.value.toLowerCase()
  return q ? publies.value.filter(p => p.titre.toLowerCase().includes(q) || p.auteur.toLowerCase().includes(q)) : publies.value
})

let enCours = false

async function ajouterLivre() {
  addNotice.value = { msg: '', type: '' }
  if (!form.titre || !form.auteur || !form.categorie) {
    addNotice.value = { msg: 'Titre, auteur et catégorie sont obligatoires.', type: 'error' }
    return
  }
  try {
    await adminFetch('livres.php', {
      method: 'POST',
      body: JSON.stringify({
        titre: form.titre, auteur: form.auteur, type: form.type, categorie: form.categorie,
        annee: parseInt(form.annee) || null,
        description: form.description || null,
        lien: form.lien || null
      })
    })
    addNotice.value = { msg: '✓ Livre publié avec succès.', type: 'success' }
    Object.assign(form, { titre: '', auteur: '', annee: '', categorie: '', type: 'classique', description: '', lien: '' })
    await charger()
  } catch (e: any) { addNotice.value = { msg: 'Erreur : ' + e.message, type: 'error' } }
}

async function supprimer(id: number) {
  if (enCours) return
  if (!confirm('Supprimer ce livre ? Cette action est irréversible.')) return
  enCours = true
  try { await adminFetch('livres.php?id=' + id, { method: 'DELETE' }); await charger() }
  catch (e: any) { alert('Erreur : ' + e.message) }
  finally { enCours = false }
}

async function validerSuggestion(id: number) {
  if (enCours) return; enCours = true
  try { await adminFetch('suggestions_livres.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'valide' }) }); await charger() }
  catch (e: any) { alert('Erreur : ' + e.message) }
  finally { enCours = false }
}

async function refuserSuggestion(id: number) {
  if (enCours) return; enCours = true
  try { await adminFetch('suggestions_livres.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'refuse' }) }); await charger() }
  catch (e: any) { alert('Erreur : ' + e.message) }
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

    <!-- NAVBAR -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo-tsa.svg" alt="" class="h-6 w-auto" />
          <h1 class="font-bold text-gray-900">📚 Livres TSA</h1>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/admin" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Admin Annuaire</NuxtLink>
          <NuxtLink to="/livres" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Voir le site</NuxtLink>
          <button type="button" class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors" @click="deconnexion">Déconnexion</button>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">

      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">⚠️ {{ loadError }}</div>

      <!-- ONGLETS -->
      <div class="flex gap-1 border-b border-gray-200 mb-6">
        <button type="button"
          v-for="tab in [
            { id: 'ajouter', label: 'Ajouter un livre' },
            { id: 'publies', label: 'Publiés' },
            { id: 'suggestions', label: 'Suggestions', count: suggestions.length }
          ]"
          :key="tab.id"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
          :class="activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1.5 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">{{ tab.count }}</span>
        </button>
      </div>

      <!-- AJOUTER -->
      <div v-if="activeTab === 'ajouter'">
        <UCard class="max-w-2xl">
          <h2 class="font-semibold text-gray-900 mb-4">Nouveau livre</h2>

          <div v-if="addNotice.msg" :class="['p-3 rounded-lg text-sm mb-4', addNotice.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700']">
            {{ addNotice.msg }}
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Titre *"><UInput v-model="form.titre" placeholder="Titre du livre" /></UFormField>
              <UFormField label="Auteur *"><UInput v-model="form.auteur" placeholder="Prénom Nom" /></UFormField>
              <UFormField label="Année"><UInput v-model="form.annee" type="number" placeholder="2024" /></UFormField>
              <UFormField label="Catégorie *">
                <select v-model="form.categorie" aria-label="Catégorie du livre" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
                  <option value="">— Choisir —</option>
                  <option v-for="c in categories" :key="c" :value="c">{{ c.charAt(0).toUpperCase() + c.slice(1) }}</option>
                </select>
              </UFormField>
              <UFormField label="Type">
                <select v-model="form.type" aria-label="Type de livre" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
                  <option value="classique">Classique</option>
                  <option value="suggestion">Suggestion communauté</option>
                </select>
              </UFormField>
              <UFormField label="Lien"><UInput v-model="form.lien" type="url" placeholder="https://…" /></UFormField>
            </div>
            <UFormField label="Description"><UTextarea v-model="form.description" placeholder="Résumé du livre…" /></UFormField>
            <div class="flex justify-end gap-3">
              <button type="button" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors" @click="Object.assign(form, { titre: '', auteur: '', annee: '', categorie: '', type: 'classique', description: '', lien: '' })">Réinitialiser</button>
              <button type="button" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors" @click="ajouterLivre">Publier le livre</button>
            </div>
          </div>
        </UCard>
      </div>

      <!-- PUBLIÉS -->
      <div v-if="activeTab === 'publies'">
        <UInput v-model="searchPublies" placeholder="Rechercher un livre…" class="mb-4 max-w-md" />
        <div v-if="!publiesFiltres.length" class="text-center py-12 text-gray-400">Aucun livre publié.</div>
        <div v-else class="space-y-3">
          <UCard v-for="d in publiesFiltres" :key="d.id">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-bold text-gray-900">{{ d.titre }}</div>
                <div class="text-sm text-gray-500">{{ d.auteur }}{{ d.annee ? ' · ' + d.annee : '' }} · {{ d.categorie }}</div>
                <div v-if="d.description" class="text-xs text-gray-400 mt-1">{{ d.description }}</div>
              </div>
              <UBadge color="neutral" variant="soft" size="xs">{{ d.type }}</UBadge>
            </div>
            <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button type="button" class="px-3 py-1.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(d.id)">Supprimer</button>
            </div>
          </UCard>
        </div>
      </div>

      <!-- SUGGESTIONS -->
      <div v-if="activeTab === 'suggestions'">
        <div v-if="!suggestions.length" class="text-center py-12 text-gray-400">Aucune suggestion en attente.</div>
        <div v-else class="space-y-3">
          <UCard v-for="s in suggestions" :key="s.id">
            <div class="font-bold text-gray-900">{{ s.titre }}</div>
            <div class="text-sm text-gray-500">{{ s.auteur }}{{ s.annee ? ' · ' + s.annee : '' }}{{ s.categorie ? ' · ' + s.categorie : '' }}</div>
            <div v-if="s.description" class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">{{ s.description }}</div>
            <div v-if="s.lien" class="text-xs mt-1"><a :href="s.lien" target="_blank" class="text-blue-600 hover:underline">{{ s.lien }}</a></div>
            <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button type="button" class="px-3 py-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors" @click="validerSuggestion(s.id)">Valider → Publier</button>
              <button type="button" class="px-3 py-1.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="refuserSuggestion(s.id)">Refuser</button>
            </div>
          </UCard>
        </div>
      </div>

    </div>
  </div>
</template>
