<script setup lang="ts">
import { MOTIF_RETRAIT } from '~/types/index'
import type { Praticien, Signalement, SuggestionPraticien } from '~/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Administration — Annuaire TSA' })

const token = ref('')
const fiches = ref<Praticien[]>([])
const attente = ref<SuggestionPraticien[]>([])
const signalements = ref<Signalement[]>([])
const activeTab = ref('attente')
const refusees = ref<SuggestionPraticien[]>([])
const searchPublies = ref('')
const loading = ref(true)
const loadError = ref('')
const SEUIL = 3

onMounted(async () => {
  token.value = sessionStorage.getItem('admin_token') || ''
  if (!token.value) {
    navigateTo('/admin/login')
    return
  }
  activeTab.value = sessionStorage.getItem('admin_tab') || 'attente'
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
  if (!res.ok) throw new Error('Erreur ' + res.status)
  return res.json()
}

async function charger() {
  loading.value = true
  try {
    const [p, a, s, r] = await Promise.all([
      adminFetch('admin_praticiens.php'),
      adminFetch('suggestions.php?statut=en_attente'),
      adminFetch('signalements.php?statut=ouvert'),
      adminFetch('suggestions.php?statut=refuse')
    ])
    fiches.value = p
    attente.value = a
    signalements.value = s
    refusees.value = r
  } catch (e) {
    loadError.value = 'Erreur de chargement : ' + ((e as Error).message ?? 'inconnue')
  } finally {
    loading.value = false
  }
}

const publies = computed(() => fiches.value.filter(p => p.statut === 'publie'))
const masquees = computed(() => fiches.value.filter(p => p.statut !== 'publie'))

const alertes = computed(() =>
  publies.value.filter(p => nbSignalements(p.id) >= SEUIL)
)

// Vues enregistrées sur les fiches publiées.
//
// Ce sont les questions qu'on se pose réellement sur l'état du fonds, et pour
// lesquelles il fallait jusqu'ici sortir du navigateur — outils/verifier-
// praticiens.py existe précisément parce que ce panneau ne savait pas y
// répondre. Tout se calcule sur les données déjà chargées : pas de nouvelle
// route d'API.
const VUES = [
  { id: 'toutes', label: 'Toutes', test: () => true },
  {
    id: 'sans-contact',
    label: 'Sans moyen de contact',
    aide: 'Ni téléphone, ni site, ni formulaire de contact actif. Ces fiches ne mènent nulle part : à compléter ou à retirer.',
    test: (p: Praticien) => !p.telephone && !p.site_web && !p.contact_actif
  },
  {
    id: 'jamais-confirmee',
    label: 'Jamais confirmée',
    aide: 'Aucune famille ne les a encore validées. Ce n\'est pas un défaut en soi, mais un bon point de départ pour une vérification.',
    test: (p: Praticien) => !p.confirmations
  },
  {
    id: 'sans-identifiant',
    label: 'Sans identifiant',
    aide: 'Ni RPPS, ni ADELI, ni SIRET. Vos propres règles d\'admission en font une condition bloquante.',
    test: (p: Praticien) => !p.adeli
  },
  {
    id: 'bilans-inconnus',
    label: 'Bilans non renseignés',
    aide: 'On ignore si ces praticiens réalisent des bilans. Elles restent visibles partout, seulement absentes du filtre correspondant.',
    test: (p: Praticien) => p.fait_bilans === null || p.fait_bilans === undefined
  }
] as const

const vueActive = ref<string>('toutes')
const vueCourante = computed(() => VUES.find(v => v.id === vueActive.value) ?? VUES[0])

function comptePourVue(vue: typeof VUES[number]) {
  return publies.value.filter(vue.test).length
}

const publiesFiltres = computed(() => {
  const q = searchPublies.value.toLowerCase().trim()
  return publies.value
    .filter(vueCourante.value.test)
    .filter(p => !q
      || p.nom.toLowerCase().includes(q)
      || p.ville.toLowerCase().includes(q)
      || p.departement.toLowerCase().includes(q)
      || p.type.toLowerCase().includes(q))
})

// Aperçu compact des sept rubriques d'une suggestion en attente, sans balise
// HTML injectée (les champs sont du texte simple depuis l'abandon de Tiptap).
const LABELS_APERCU: Array<[keyof SuggestionPraticien, string]> = [
  ['types_intervention', 'Types d\'intervention'],
  ['bilans', 'Bilans'],
  ['formations', 'Formations complémentaires'],
  ['experience', 'Expérience'],
  ['modalites', 'Modalités'],
  ['tarifs', 'Tarifs'],
  ['autres_infos', 'Autres informations']
]

function notesApercu(d: SuggestionPraticien) {
  return LABELS_APERCU
    .filter(([champ]) => d[champ])
    .map(([champ, label]) => ({ label, valeur: d[champ] as string }))
}

function nbSignalements(id: number) {
  return signalements.value.filter(s => s.praticien_id === id).length
}

function setTab(tab: string) {
  activeTab.value = tab
  sessionStorage.setItem('admin_tab', tab)
}

// Réactif, contrairement à l'ancien `let` : il empêchait bien le double clic
// mais ne changeait rien à l'écran — on cliquait « Valider » et rien ne bougeait
// pendant la requête, sans savoir si le clic avait été pris.
const enCours = ref(false)

// Bande « annuler » plutôt que boîte de confirmation. Plus rapide dans le cas
// normal — aucun clic supplémentaire — et plus sûr dans le cas rare, puisque
// valider et refuser ne se rattrapaient pas du tout jusqu'ici.
const DUREE_ANNULATION = 8000
const derniereAction = ref<{ texte: string, retablir: () => Promise<void> } | null>(null)
let minuteurAnnulation: ReturnType<typeof setTimeout> | null = null

function proposerAnnulation(texte: string, retablir: () => Promise<void>) {
  if (minuteurAnnulation) clearTimeout(minuteurAnnulation)
  derniereAction.value = { texte, retablir }
  minuteurAnnulation = setTimeout(() => {
    derniereAction.value = null
  }, DUREE_ANNULATION)
}

onBeforeUnmount(() => {
  if (minuteurAnnulation) clearTimeout(minuteurAnnulation)
})

async function annulerDerniereAction() {
  const action = derniereAction.value
  if (!action) return
  derniereAction.value = null
  if (minuteurAnnulation) clearTimeout(minuteurAnnulation)
  await agir(action.retablir)
}

/**
 * Exécute une action puis met la liste à jour sur place.
 *
 * L'ancien code relançait charger() après chaque validation, chaque refus,
 * chaque mise en pause : trois appels et les 319 praticiens retéléchargés pour
 * un seul changement, la liste reconstruite, et la position de défilement
 * perdue à chaque fois. On ne recharge plus qu'en cas d'échec, pour se
 * resynchroniser sur ce que le serveur a réellement retenu.
 */
async function agir(operation: () => Promise<void>) {
  if (enCours.value) return
  enCours.value = true
  erreurAction.value = ''
  try {
    await operation()
  } catch (e) {
    erreurAction.value = (e as Error).message
    await charger()
  } finally {
    enCours.value = false
  }
}

// Affichée dans la page plutôt qu'en alert() : ces fenêtres bloquent tout,
// ne se ferment qu'au clic, et coupent le rythme quand on traite une série.
const erreurAction = ref('')

function retirerDeLAttente(id: number) {
  const i = attente.value.findIndex(d => d.id === id)
  if (i !== -1) return attente.value.splice(i, 1)[0]
  return null
}

async function valider(id: number) {
  await agir(async () => {
    await adminFetch('suggestions.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'valide' }) })
    retirerDeLAttente(id)
    // La fiche créée n'est pas dans la liste locale : c'est le seul cas où un
    // rechargement se justifie, et il ne coûte rien puisqu'il est unique.
    await charger()
  })
}

async function refuser(id: number) {
  const suggestion = attente.value.find(d => d.id === id)
  const nom = suggestion?.nom ?? 'La suggestion'
  await agir(async () => {
    await adminFetch('suggestions.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'refuse' }) })
    const retiree = retirerDeLAttente(id)
    if (retiree) refusees.value.unshift(retiree)
    proposerAnnulation(`${nom} — refusée`, () => remettreEnAttente(id))
  })
}

async function remettreEnAttente(id: number) {
  await adminFetch('suggestions.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'en_attente' }) })
  const i = refusees.value.findIndex(d => d.id === id)
  if (i === -1) return
  const [restauree] = refusees.value.splice(i, 1)
  if (restauree) attente.value.push(restauree)
}

async function restaurer(id: number) {
  await agir(() => remettreEnAttente(id))
}

async function supprimer(id: number) {
  // Seule action réellement irréversible du panneau : elle garde sa
  // confirmation, là où valider et refuser gagnent à s'annuler après coup.
  if (!confirm('Supprimer définitivement ce praticien ? Cette action est irréversible.')) return
  await agir(async () => {
    await adminFetch('admin_praticiens.php?id=' + id, { method: 'DELETE' })
    fiches.value = fiches.value.filter(f => f.id !== id)
  })
}

async function basculerVisibilite(id: number, statut: string) {
  const fiche = fiches.value.find(f => f.id === id)
  const ancien = fiche?.statut
  await agir(async () => {
    await adminFetch('admin_praticiens.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut }) })
    if (fiche) fiche.statut = statut
    proposerAnnulation(
      statut === 'masquee' ? `${fiche?.nom} — mise en pause` : `${fiche?.nom} — remise en ligne`,
      async () => {
        await adminFetch('admin_praticiens.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: ancien }) })
        if (fiche && ancien) fiche.statut = ancien
      }
    )
  })
}

async function ignorerSignalement(id: number) {
  await agir(async () => {
    await adminFetch('signalements.php?id=' + id, { method: 'PATCH', body: JSON.stringify({ statut: 'ignore' }) })
    signalements.value = signalements.value.filter(s => s.id !== id)
  })
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
          <NuxtLink to="/admin/videos" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            🎬 Vidéos
          </NuxtLink>
          <NuxtLink to="/admin/associations" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            🤝 Associations
          </NuxtLink>
          <NuxtLink to="/" class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Voir le site
          </NuxtLink>
          <button type="button"
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
        <!-- Cliquables : « 3 signalements » affiché sans l'être obligeait à
             aller chercher l'onglet correspondant à chaque consultation. -->
        <button
          v-for="stat in [
            { tab: 'publies', val: publies.length, label: 'Praticiens publiés', color: 'text-blue-600' },
            { tab: 'masquees', val: masquees.length, label: 'Fiches en pause', color: 'text-gray-600' },
            { tab: 'attente', val: attente.length, label: 'En attente', color: 'text-amber-600' },
            { tab: 'signalements', val: signalements.length, label: 'Signalements', color: 'text-red-600' },
            { tab: 'alertes', val: alertes.length, label: 'Alertes', color: 'text-red-700' }
          ]"
          :key="stat.label"
          type="button"
          class="text-left bg-white border rounded-xl px-4 py-3 transition-colors"
          :class="activeTab === stat.tab ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-400'"
          :aria-current="activeTab === stat.tab ? 'true' : undefined"
          @click="setTab(stat.tab)"
        >
          <div :class="['text-2xl font-bold tabular-nums', stat.color]">{{ stat.val }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
        </button>
      </div>

      <!-- ERREUR CHARGEMENT -->
      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">⚠️ {{ loadError }}</div>

      <!-- Affichée dans la page plutôt qu'en alert() : une fenêtre modale
           bloque tout et coupe le rythme quand on traite une série. -->
      <div v-if="erreurAction" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4 flex items-start gap-3">
        <span aria-hidden="true">⚠️</span>
        <span class="flex-1">L'action a échoué : {{ erreurAction }}. La liste a été rechargée pour refléter ce que le serveur a réellement retenu.</span>
        <button type="button" class="text-red-500 hover:text-red-700" aria-label="Fermer" @click="erreurAction = ''">×</button>
      </div>

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
          <button type="button"
            v-for="tab in [
              { id: 'attente', label: 'En attente', count: attente.length },
              { id: 'publies', label: 'Publiés', count: null },
              { id: 'masquees', label: 'En pause', count: masquees.length },
              { id: 'signalements', label: 'Signalements', count: signalements.length },
              { id: 'alertes', label: 'Alertes', count: alertes.length },
              { id: 'refusees', label: 'Refusées', count: refusees.length }
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
          <div v-if="!attente.length" class="text-center py-12 text-gray-500">Aucune fiche en attente.</div>
          <div v-else class="space-y-3">
            <UCard v-for="d in attente" :key="d.id">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="font-bold text-gray-900">{{ d.nom }}</div>
                  <div class="text-sm text-gray-500">
                    {{ d.type }} · {{ d.ville }}{{ d.ville2 ? ' + ' + d.ville2 : '' }} ({{ d.departement }}{{ d.departement2 ? ', ' + d.departement2 : '' }})
                  </div>
                  <div v-if="d.adeli" class="text-xs text-gray-500 mt-1">ADELI/RPPS : {{ d.adeli }}</div>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <UBadge v-for="age in d.ages" :key="age" color="primary" variant="soft" size="xs">{{ age }}</UBadge>
                    <UBadge v-if="d.teleconsultation" color="success" variant="soft" size="xs">Téléconsultation</UBadge>
                  </div>
                  <div v-if="d.telephone" class="text-sm text-blue-600 mt-2">☎ {{ d.telephone }}</div>
                  <div v-if="notesApercu(d).length" class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded space-y-1">
                    <div v-for="champ in notesApercu(d)" :key="champ.label"><strong>{{ champ.label }} :</strong> {{ champ.valeur }}</div>
                  </div>
                  <ContactAuteurAdmin :contact="d.contact_auteur" :objet="`votre suggestion — ${d.nom}`" />
                </div>
                <UBadge color="neutral" variant="soft" size="xs">{{ d.source === 'praticien' ? 'Auto-déclaré' : 'Communauté' }}</UBadge>
              </div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button type="button" class="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors" @click="valider(d.id)">Valider</button>
                <button type="button" class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="refuser(d.id)">Refuser</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- PUBLIÉS -->
        <div v-if="activeTab === 'publies'">
          <UInput v-model="searchPublies" placeholder="Nom, ville, département, métier…" icon="i-lucide-search" class="mb-4 max-w-md" />

          <div class="flex flex-wrap gap-2 mb-3">
            <button
              v-for="v in VUES"
              :key="v.id"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              :class="vueActive === v.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              :aria-pressed="vueActive === v.id"
              @click="vueActive = v.id"
            >
              {{ v.label }} <span class="tabular-nums opacity-60">{{ comptePourVue(v) }}</span>
            </button>
          </div>

          <p v-if="'aide' in vueCourante && vueCourante.aide" class="text-sm text-gray-500 mb-4 border-l-4 border-l-gray-300 pl-3">
            {{ vueCourante.aide }}
          </p>
          <div v-if="!publiesFiltres.length" class="text-center py-12 text-gray-500">Aucun résultat.</div>
          <div v-else class="space-y-3">
            <UCard v-for="d in publiesFiltres" :key="d.id">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="font-bold text-gray-900">{{ d.nom }}</div>
                  <div class="text-sm text-gray-500">{{ d.type }} · {{ d.ville }} ({{ d.departement }})</div>
                  <div class="flex gap-3 mt-2 text-xs text-gray-500">
                    <span class="text-green-600">✓ {{ d.confirmations || 0 }} confirmation{{ (d.confirmations || 0) > 1 ? 's' : '' }}</span>
                    <span v-if="nbSignalements(d.id) > 0" class="text-red-600">⚠ {{ nbSignalements(d.id) }} signalement{{ nbSignalements(d.id) > 1 ? 's' : '' }}</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <NuxtLink :to="`/admin/modifier?id=${d.id}`" class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Modifier</NuxtLink>
                <button type="button" class="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors" @click="basculerVisibilite(d.id, 'masquee')">Mettre en pause</button>
                <button type="button" class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(d.id)">Supprimer</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- EN PAUSE -->
        <div v-if="activeTab === 'masquees'">
          <div v-if="!masquees.length" class="text-center py-12 text-gray-500">Aucune fiche en pause.</div>
          <div v-else class="space-y-3">
            <p class="text-sm text-gray-500 mb-4">
              Ces fiches n'apparaissent ni dans l'annuaire, ni dans les pages département,
              ni dans le plan du site. Aucune donnée n'a été perdue.
            </p>
            <UCard v-for="d in masquees" :key="d.id" class="opacity-75">
              <div class="font-bold text-gray-900">{{ d.nom }}</div>
              <div class="text-sm text-gray-500">{{ d.type }} · {{ d.ville }} ({{ d.departement }})</div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                <button type="button" class="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors" @click="basculerVisibilite(d.id, 'publie')">Remettre en ligne</button>
                <NuxtLink :to="`/admin/modifier?id=${d.id}`" class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Modifier</NuxtLink>
                <button type="button" class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(d.id)">Supprimer</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- SIGNALEMENTS -->
        <div v-if="activeTab === 'signalements'">
          <div v-if="!signalements.length" class="text-center py-12 text-gray-500">Aucun signalement en cours.</div>
          <div v-else class="space-y-3">
            <UCard v-for="s in signalements" :key="s.id" :class="s.motif === MOTIF_RETRAIT ? 'ring-2 ring-red-400' : ''">
              <div v-if="s.motif === MOTIF_RETRAIT" class="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-semibold">
                ⚠ Demande de retrait par le praticien · délai légal : un mois maximum
              </div>
              <div class="font-bold text-gray-900">{{ s.praticien_nom || 'Praticien #' + s.praticien_id }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ s.motif }}</div>
              <div v-if="s.detail" class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">{{ s.detail }}</div>
              <ContactAuteurAdmin :contact="s.contact_auteur" :objet="`votre signalement — ${s.praticien_nom}`" />
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                <NuxtLink :to="`/admin/modifier?id=${s.praticien_id}`" class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Modifier la fiche</NuxtLink>
                <button type="button" v-if="s.motif === MOTIF_RETRAIT" class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(s.praticien_id)">Supprimer la fiche</button>
                <button type="button" class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors" @click="ignorerSignalement(s.id)">Ignorer</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- ALERTES -->
        <div v-if="activeTab === 'alertes'">
          <div v-if="!alertes.length" class="text-center py-12 text-gray-500">Aucune fiche en alerte.</div>
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
                <button type="button" class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="supprimer(d.id)">Supprimer</button>
              </div>
            </UCard>
          </div>
        </div>

        <!-- REFUSÉES -->
        <div v-if="activeTab === 'refusees'">
          <div v-if="!refusees.length" class="text-center py-12 text-gray-500">Aucune suggestion refusée.</div>
          <div v-else class="space-y-3">
            <p class="text-sm text-gray-500 mb-4">
              Ces suggestions ont été écartées mais restent conservées. Un refus
              par erreur se rattrape ici, sans passer par la base.
            </p>
            <UCard v-for="d in refusees" :key="d.id" class="opacity-80">
              <div class="font-bold text-gray-900">{{ d.nom }}</div>
              <div class="text-sm text-gray-500">
                {{ d.type }} · {{ d.ville }} ({{ d.departement }})
              </div>
              <ContactAuteurAdmin :contact="d.contact_auteur" :objet="`votre suggestion — ${d.nom}`" />
              <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button type="button" :disabled="enCours" class="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors" @click="restaurer(d.id)">
                  Remettre en attente
                </button>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </div>

    <!-- Bande d'annulation : huit secondes pour revenir sur une action, plutôt
         qu'une confirmation à chaque fois. -->
    <div v-if="derniereAction" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-4 text-sm">
      <span>{{ derniereAction.texte }}</span>
      <button type="button" class="font-bold bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1 transition-colors" @click="annulerDerniereAction">
        Annuler
      </button>
    </div>
  </div>
</template>
