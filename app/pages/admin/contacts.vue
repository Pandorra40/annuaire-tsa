<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Formulaires de contact — Annuaire TSA' })

interface FicheContact {
  id: number
  nom: string
  ville: string
  departement: string
  statut: string
  contact_email: string | null
  contact_actif: boolean
  contact_consentement: string | null
}

const token = ref('')
const fiches = ref<FicheContact[]>([])
const search = ref('')
const seulementActifs = ref(false)
const loading = ref(true)
const loadError = ref('')

// Saisie locale : l'email tapé n'est envoyé qu'à l'enregistrement de la ligne,
// pour ne pas déclencher une requête à chaque frappe.
const brouillons = reactive<Record<number, string>>({})
const enregistrement = ref<number | null>(null)
const enregistre = ref<number | null>(null)
let enregistreTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  token.value = sessionStorage.getItem('admin_token') || ''
  if (!token.value) { navigateTo('/admin/login'); return }
  await charger()
})

onUnmounted(() => { if (enregistreTimer) clearTimeout(enregistreTimer) })

async function adminFetch(url: string, options: any = {}) {
  const res = await fetch('/api/' + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token.value, ...options.headers }
  })
  if (res.status === 401) { navigateTo('/admin/login'); throw new Error('Non authentifié') }
  if (!res.ok) {
    const detail = await res.json().catch(() => null)
    throw new Error(detail?.error ?? 'Erreur ' + res.status)
  }
  return res.json()
}

async function charger() {
  loading.value = true
  try {
    fiches.value = await adminFetch('admin_praticiens.php')
    for (const f of fiches.value) brouillons[f.id] = f.contact_email ?? ''
  } catch (e: any) {
    loadError.value = 'Erreur de chargement : ' + (e.message ?? 'inconnue')
  } finally { loading.value = false }
}

const actifs = computed(() => fiches.value.filter(f => f.contact_actif).length)

const filtrees = computed(() => {
  const q = search.value.trim().toLowerCase()
  return fiches.value.filter(f => {
    if (seulementActifs.value && !f.contact_actif) return false
    if (!q) return true
    return f.nom.toLowerCase().includes(q)
      || (f.ville ?? '').toLowerCase().includes(q)
      || (f.departement ?? '').includes(q)
      || (f.contact_email ?? '').toLowerCase().includes(q)
  })
})

function modifie(f: FicheContact) {
  return (brouillons[f.id] ?? '') !== (f.contact_email ?? '')
}

async function enregistrer(f: FicheContact, actif: boolean) {
  if (enregistrement.value !== null) return
  const email = (brouillons[f.id] ?? '').trim()

  // Activer sans adresse n'a pas de sens : le message n'aurait nulle part où aller.
  if (actif && !email) {
    alert('Renseignez d’abord l’adresse email du praticien.')
    return
  }
  if (!email && f.contact_email && !confirm(`Effacer l’adresse enregistrée pour ${f.nom} ?`)) return

  enregistrement.value = f.id
  try {
    await adminFetch('admin_praticiens.php?id=' + f.id, {
      method: 'PATCH',
      body: JSON.stringify({ contact: { email, actif } })
    })
    // Rechargement ciblé : la date de consentement est posée par le serveur au
    // premier accord, on ne peut pas la deviner ici.
    const maj: FicheContact = await adminFetch('admin_praticiens.php?id=' + f.id)
    Object.assign(f, {
      contact_email: maj.contact_email,
      contact_actif: maj.contact_actif,
      contact_consentement: maj.contact_consentement
    })
    brouillons[f.id] = maj.contact_email ?? ''
    enregistre.value = f.id
    if (enregistreTimer) clearTimeout(enregistreTimer)
    enregistreTimer = setTimeout(() => enregistre.value = null, 2500)
  } catch (e: any) {
    alert('Erreur : ' + (e as Error).message)
  } finally { enregistrement.value = null }
}

function dateCourte(iso: string | null) {
  if (!iso) return null
  return new Date(iso.replace(' ', 'T')).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- NAVBAR ADMIN -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo-tsa.svg" alt="" class="h-6 w-auto" />
          <span class="font-bold text-gray-900">Formulaires de contact</span>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/admin" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            ← Administration
          </NuxtLink>
          <NuxtLink to="/" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Voir le site
          </NuxtLink>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-8">

      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 mb-6">
        ⚠️ {{ loadError }}
      </div>

      <!-- RAPPEL RGPD -->
      <div class="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-sm text-indigo-900 leading-relaxed mb-6">
        N’activez un formulaire qu’après un accord explicite du praticien. La date d’accord
        est enregistrée au premier passage en actif : c’est la preuve du consentement, elle
        n’est plus modifiée ensuite. Chaque message envoyé contient un lien permettant au
        praticien de couper son formulaire lui-même.
      </div>

      <!-- BARRE D'OUTILS -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
        <input
          v-model="search"
          type="search"
          aria-label="Rechercher un nom, une ville ou un département"
          placeholder="Rechercher un nom, une ville, un département…"
          class="flex-1 min-w-60 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        <label class="flex items-center gap-2 text-sm text-gray-600 select-none">
          <input v-model="seulementActifs" type="checkbox" class="rounded border-gray-300" />
          Formulaires actifs seulement
        </label>
        <span class="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {{ actifs }} actif{{ actifs > 1 ? 's' : '' }} / {{ fiches.length }}
        </span>
      </div>

      <div v-if="loading" class="text-center text-gray-400 py-16">Chargement…</div>

      <p v-else-if="!filtrees.length" class="text-center text-gray-400 py-16">
        Aucune fiche ne correspond à cette recherche.
      </p>

      <!-- LISTE -->
      <div v-else class="space-y-2">
        <div
          v-for="f in filtrees"
          :key="f.id"
          class="bg-white rounded-xl border shadow-sm px-4 py-3 flex flex-wrap items-center gap-3"
          :class="f.contact_actif ? 'border-emerald-200' : 'border-gray-200'"
        >
          <div class="min-w-52 flex-1">
            <div class="font-semibold text-gray-900 text-sm flex items-center gap-2">
              {{ f.nom }}
              <span v-if="f.statut !== 'publie'" class="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                en pause
              </span>
            </div>
            <div class="text-xs text-gray-500">
              {{ f.ville }} <span v-if="f.departement">({{ f.departement }})</span>
              <NuxtLink :to="`/praticien/${f.id}`" target="_blank" class="ml-2 text-indigo-600 hover:underline">fiche →</NuxtLink>
            </div>
          </div>

          <input
            v-model="brouillons[f.id]"
            type="email"
            :aria-label="`Adresse email de ${f.nom}`"
            placeholder="adresse email du praticien"
            class="flex-1 min-w-64 border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            :class="modifie(f) ? 'border-amber-300' : 'border-gray-200'"
            @keyup.enter="enregistrer(f, f.contact_actif)"
          />

          <div class="text-xs text-gray-500 w-28 text-center">
            <span v-if="f.contact_consentement">accord {{ dateCourte(f.contact_consentement) }}</span>
            <span v-else class="text-gray-300">—</span>
          </div>

          <div class="flex items-center gap-2">
            <button type="button"
              v-if="modifie(f)"
              :disabled="enregistrement === f.id"
              class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              @click="enregistrer(f, f.contact_actif)"
            >
              Enregistrer
            </button>
            <span v-else-if="enregistre === f.id" class="text-xs text-emerald-600 font-medium">✓ enregistré</span>

            <button type="button"
              :disabled="enregistrement === f.id"
              class="px-3 py-1.5 text-xs font-semibold rounded-lg border-2 disabled:opacity-50 transition-colors whitespace-nowrap"
              :class="f.contact_actif
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
              @click="enregistrer(f, !f.contact_actif)"
            >
              {{ f.contact_actif ? '● Actif' : '○ Inactif' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
