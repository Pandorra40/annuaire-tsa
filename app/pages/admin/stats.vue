<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({
  title: 'Statistiques — Annuaire TSA',
  robots: 'noindex, nofollow'
})

type Periode = '7j' | '30j' | '3m' | '6m'

interface StatsPayload {
  periode: Periode
  jours: number
  depuis: string
  visites: {
    aujourdhui: number
    periode: number
    serie: { jour: string, hits: number }[]
    top_pages: { path: string, hits: number }[]
  }
  metier: Record<string, number>
}

interface LoginEntry {
  id: number
  created_at: string
  ip: string
  success: boolean
}

interface IpExclude {
  id: number
  ip: string
  note: string | null
  created_at: string
}

const periodes: { id: Periode, label: string }[] = [
  { id: '7j', label: '7 jours' },
  { id: '30j', label: '30 jours' },
  { id: '3m', label: '3 mois' },
  { id: '6m', label: '6 mois' }
]

const { adminFetch } = useAdminAuth()

const periode = ref<Periode>('7j')
const loading = ref(true)
const error = ref('')
const data = ref<StatsPayload | null>(null)

const journal = ref<LoginEntry[]>([])
const journalError = ref('')
const clientIp = ref('')

const ips = ref<IpExclude[]>([])
const ipsError = ref('')
const nouvelleIp = ref('')
const nouvelleNote = ref('')
const ipBusy = ref(false)

async function chargerStats() {
  loading.value = true
  error.value = ''
  try {
    data.value = await adminFetch<StatsPayload>(
      'stats.php?periode=' + encodeURIComponent(periode.value)
    )
  } catch (e) {
    error.value = 'Impossible de charger les statistiques : ' + ((e as Error).message ?? 'erreur')
    data.value = null
  } finally {
    loading.value = false
  }
}

async function chargerJournal() {
  journalError.value = ''
  try {
    const res = await adminFetch<{ client_ip: string, entries: LoginEntry[] }>(
      'admin_login_log.php?limit=50'
    )
    journal.value = res.entries
    if (res.client_ip) clientIp.value = res.client_ip
  } catch (e) {
    journalError.value = (e as Error).message ?? 'Erreur journal'
  }
}

async function chargerIps() {
  ipsError.value = ''
  try {
    const res = await adminFetch<{ client_ip: string, ips: IpExclude[] }>(
      'admin_stats_exclude.php'
    )
    ips.value = res.ips
    if (res.client_ip) clientIp.value = res.client_ip
  } catch (e) {
    ipsError.value = (e as Error).message ?? 'Erreur IP'
  }
}

async function ajouterIp(opts: { useClient?: boolean } = {}) {
  if (ipBusy.value) return
  ipBusy.value = true
  ipsError.value = ''
  try {
    const body = opts.useClient
      ? { use_client_ip: true, note: nouvelleNote.value.trim() || 'Admin — cette session' }
      : { ip: nouvelleIp.value.trim(), note: nouvelleNote.value.trim() || null }
    await adminFetch('admin_stats_exclude.php', {
      method: 'POST',
      body: JSON.stringify(body)
    })
    nouvelleIp.value = ''
    nouvelleNote.value = ''
    await chargerIps()
  } catch (e) {
    ipsError.value = (e as Error).message ?? 'Erreur'
  } finally {
    ipBusy.value = false
  }
}

async function supprimerIp(row: IpExclude) {
  if (!confirm(`Retirer ${row.ip} des exclusions ?`)) return
  ipBusy.value = true
  try {
    await adminFetch('admin_stats_exclude.php?id=' + row.id, { method: 'DELETE' })
    await chargerIps()
  } catch (e) {
    ipsError.value = (e as Error).message ?? 'Erreur'
  } finally {
    ipBusy.value = false
  }
}

watch(periode, () => { void chargerStats() })

onMounted(() => {
  void chargerStats()
  void chargerJournal()
  void chargerIps()
})

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => { void chargerStats() }, 60_000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const maxSerie = computed(() => {
  const s = data.value?.visites.serie ?? []
  return Math.max(1, ...s.map(p => p.hits))
})

const labelsMetier: { key: string, label: string }[] = [
  { key: 'praticiens_publies', label: 'Praticiens publiés' },
  { key: 'associations_publiees', label: 'Associations publiées' },
  { key: 'suggestions_praticiens', label: 'Suggestions praticiens' },
  { key: 'suggestions_associations', label: 'Suggestions associations' },
  { key: 'suggestions_livres', label: 'Suggestions livres' },
  { key: 'signalements_ouverts', label: 'Signalements ouverts' },
  { key: 'livres', label: 'Livres publiés' },
  { key: 'videos', label: 'Vidéos / chaînes' }
]

function dateHeure(iso: string) {
  return new Date(iso.replace(' ', 'T')).toLocaleString('fr-FR')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo-tsa.svg" alt="" class="h-6 w-auto">
          <span class="font-bold text-gray-900">Statistiques</span>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/admin"
            class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Administration
          </NuxtLink>
          <NuxtLink
            to="/"
            class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Voir le site
          </NuxtLink>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <p class="text-sm text-gray-500 max-w-2xl leading-relaxed">
        Visites mesurées côté navigateur (sans cookie). Les robots et crawlers
        qui n’exécutent pas JavaScript ne sont en principe pas comptés ;
        les User-Agent suspects sont aussi filtrés côté serveur.
        Votre IP peut être exclue ci-dessous pour ne pas fausser les compteurs.
        Actualisation automatique chaque minute.
      </p>

      <!-- Période -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in periodes"
          :key="p.id"
          type="button"
          class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
          :class="periode === p.id
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
          @click="periode = p.id"
        >
          {{ p.label }}
        </button>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="loading && !data" class="text-sm text-gray-500 py-12 text-center">
        Chargement…
      </div>

      <template v-if="data">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="bg-white border border-gray-200 rounded-2xl p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Aujourd’hui</p>
            <p class="text-3xl font-black text-gray-900 mt-1 tabular-nums">
              {{ data.visites.aujourdhui.toLocaleString('fr-FR') }}
            </p>
          </div>
          <div class="bg-white border border-gray-200 rounded-2xl p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Période ({{ periodes.find(p => p.id === periode)?.label }})
            </p>
            <p class="text-3xl font-black text-gray-900 mt-1 tabular-nums">
              {{ data.visites.periode.toLocaleString('fr-FR') }}
            </p>
          </div>
          <div class="bg-white border border-gray-200 rounded-2xl p-5 col-span-2 sm:col-span-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Depuis</p>
            <p class="text-lg font-semibold text-gray-900 mt-2">
              {{ data.depuis }}
            </p>
          </div>
        </div>

        <section class="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 class="text-sm font-bold text-gray-900 mb-4">Visites par jour</h2>
          <div
            v-if="data.visites.serie.length === 0"
            class="text-sm text-gray-500"
          >
            Aucune visite enregistrée sur cette période.
          </div>
          <div
            v-else
            class="flex items-end gap-0.5 h-32 overflow-x-auto"
            role="img"
            :aria-label="`Histogramme des visites sur ${data.jours} jours`"
          >
            <div
              v-for="pt in data.visites.serie"
              :key="pt.jour"
              class="flex-1 min-w-[4px] max-w-[24px] bg-gray-200 rounded-t hover:bg-gray-400 transition-colors"
              :style="{ height: `${Math.max(2, (pt.hits / maxSerie) * 100)}%` }"
              :title="`${pt.jour} : ${pt.hits}`"
            />
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section class="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 class="text-sm font-bold text-gray-900 mb-4">Pages les plus vues</h2>
            <ul v-if="data.visites.top_pages.length" class="divide-y divide-gray-100">
              <li
                v-for="row in data.visites.top_pages"
                :key="row.path"
                class="flex items-center justify-between gap-4 py-2.5 text-sm"
              >
                <code class="text-gray-800 truncate">{{ row.path }}</code>
                <span class="tabular-nums font-semibold text-gray-900 shrink-0">
                  {{ row.hits.toLocaleString('fr-FR') }}
                </span>
              </li>
            </ul>
            <p v-else class="text-sm text-gray-500">Pas encore de données.</p>
          </section>

          <section class="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 class="text-sm font-bold text-gray-900 mb-4">Volumes métier</h2>
            <ul class="divide-y divide-gray-100">
              <li
                v-for="item in labelsMetier"
                :key="item.key"
                class="flex items-center justify-between gap-4 py-2.5 text-sm"
              >
                <span class="text-gray-700">{{ item.label }}</span>
                <span class="tabular-nums font-semibold text-gray-900">
                  {{ (data.metier[item.key] ?? 0).toLocaleString('fr-FR') }}
                </span>
              </li>
            </ul>
          </section>
        </div>
      </template>

      <!-- Exclusion IP -->
      <section class="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 class="text-sm font-bold text-gray-900 mb-1">IP exclues des compteurs</h2>
        <p class="text-sm text-gray-500 mb-4 leading-relaxed">
          Ces adresses ne sont pas comptées dans les visites (l’IP n’est jamais stockée dans les stats).
          <span v-if="clientIp">Votre IP actuelle : <code class="text-gray-800">{{ clientIp }}</code>.</span>
        </p>

        <div v-if="ipsError" class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">
          {{ ipsError }}
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <input
            v-model="nouvelleIp"
            type="text"
            placeholder="IP (ex. 203.0.113.10)"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg w-48"
            :disabled="ipBusy"
          >
          <input
            v-model="nouvelleNote"
            type="text"
            placeholder="Note (optionnel)"
            maxlength="100"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg flex-1 min-w-[10rem]"
            :disabled="ipBusy"
          >
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg disabled:opacity-50"
            :disabled="ipBusy || !nouvelleIp.trim()"
            @click="ajouterIp()"
          >
            Ajouter
          </button>
          <button
            type="button"
            class="px-3 py-2 text-sm font-medium border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            :disabled="ipBusy || !clientIp"
            @click="ajouterIp({ useClient: true })"
          >
            Ajouter mon IP
          </button>
        </div>

        <ul v-if="ips.length" class="divide-y divide-gray-100">
          <li
            v-for="row in ips"
            :key="row.id"
            class="flex items-center justify-between gap-4 py-2.5 text-sm"
          >
            <div class="min-w-0">
              <code class="text-gray-900 font-medium">{{ row.ip }}</code>
              <span v-if="row.note" class="text-gray-500 ml-2">{{ row.note }}</span>
              <span class="text-gray-400 ml-2 text-xs">{{ dateHeure(row.created_at) }}</span>
            </div>
            <button
              type="button"
              class="text-red-600 hover:text-red-800 text-sm shrink-0"
              :disabled="ipBusy"
              @click="supprimerIp(row)"
            >
              Retirer
            </button>
          </li>
        </ul>
        <p v-else class="text-sm text-gray-500">Aucune IP exclue pour l’instant.</p>
      </section>

      <!-- Journal login -->
      <section class="bg-white border border-gray-200 rounded-2xl p-5">
        <div class="flex items-center justify-between gap-3 mb-1">
          <h2 class="text-sm font-bold text-gray-900">Journal des connexions admin</h2>
          <button
            type="button"
            class="text-sm text-gray-600 hover:text-gray-900"
            @click="chargerJournal"
          >
            Actualiser
          </button>
        </div>
        <p class="text-sm text-gray-500 mb-4 leading-relaxed">
          50 dernières tentatives. Une alerte Pushbullet part après 5 échecs
          (puis tous les 5) depuis la même IP en 15 minutes.
        </p>

        <div v-if="journalError" class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">
          {{ journalError }}
        </div>

        <div class="overflow-x-auto">
          <table v-if="journal.length" class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th class="py-2 pr-4 font-semibold">Date</th>
                <th class="py-2 pr-4 font-semibold">IP</th>
                <th class="py-2 font-semibold">Résultat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="e in journal" :key="e.id">
                <td class="py-2.5 pr-4 text-gray-700 whitespace-nowrap">{{ dateHeure(e.created_at) }}</td>
                <td class="py-2.5 pr-4"><code class="text-gray-900">{{ e.ip }}</code></td>
                <td class="py-2.5">
                  <span
                    class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="e.success
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'"
                  >
                    {{ e.success ? 'OK' : 'Échec' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-sm text-gray-500">Aucune entrée pour l’instant.</p>
        </div>
      </section>
    </div>
  </div>
</template>
