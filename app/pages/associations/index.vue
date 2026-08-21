<script setup lang="ts">
import type { Association } from '~/types/index'

useSeoMeta({
  title: 'Associations TSA — Annuaire TSA',
  description: 'Trouvez une association spécialisée dans les troubles du spectre autistique près de chez vous. Associations de familles, de personnes concernées et de professionnels TSA en France.'
})

const { fetchAssociations } = useApi()

// Chargé à la génération plutôt qu'en `server: false` : sans données au build,
// la liste était publiée vide, invisible pour les moteurs de recherche.
const { data: prerendues, status } = await useAsyncData('associations', fetchAssociations)

// La page étant prérendue, son contenu est figé au build : relire l'API au
// montage pour refléter les modifications faites depuis l'admin.
const fraiches = ref<Association[] | null>(null)

onMounted(async () => {
  try {
    const reponse = await fetchAssociations()
    if (reponse) fraiches.value = reponse
  } catch {
    // Réseau indisponible : on garde la liste du prérendu, déjà affichée.
  }
})

const associations = computed<Association[]>(() => fraiches.value ?? prerendues.value ?? [])

const enChargement = computed(() =>
  (status.value === 'pending' || status.value === 'idle') && !associations.value.length
)

const route = useRoute()
const router = useRouter()

// État initialisé depuis l'URL (restauré au retour navigateur, partageable par lien)
const search = ref((route.query.q as string) || '')
const filtreDept = ref((route.query.dept as string) || '')
// Services séparés par une virgule dans l'URL — un seul paramètre plutôt
// qu'un par service, pour rester lisible dans un lien partagé.
const servicesActifs = ref<string[]>(
  route.query.services ? (route.query.services as string).split(',').filter(Boolean) : []
)

function passeFiltres(a: Association, sauf?: 'dept' | 'service') {
  const q = normaliserRecherche(search.value).trim()
  const matchQ = !q
    || normaliserRecherche(a.nom).includes(q)
    || normaliserRecherche(a.ville).includes(q)
    || a.departement.includes(q)
    || normaliserRecherche(a.services ?? '').includes(q)
  if (!matchQ) return false
  if (sauf !== 'dept' && filtreDept.value && a.departement !== filtreDept.value) return false
  if (sauf !== 'service' && servicesActifs.value.length) {
    const services = parserServices(a.services)
    if (!servicesActifs.value.every(s => services.includes(s))) return false
  }
  return true
}

const associationsFiltrees = computed(() => associations.value.filter(a => passeFiltres(a)))

// Département en liste nommée plutôt qu'un champ où taper un numéro de
// mémoire : uniquement ceux qui ont réellement une association, avec leur
// nombre, calculé en ignorant le filtre département lui-même — sinon un
// département déjà choisi retomberait à zéro dans sa propre liste.
const departementsDisponibles = computed(() => {
  const compte = new Map<string, number>()
  for (const a of associations.value) {
    if (!a.departement || !passeFiltres(a, 'dept')) continue
    compte.set(a.departement, (compte.get(a.departement) ?? 0) + 1)
  }
  return [...compte.entries()]
    .map(([num, n]) => ({ num, nom: nomDepartement(num), n }))
    .sort((x, y) => x.num.localeCompare(y.num))
})

function compteService(service: string) {
  return associations.value.filter(a => passeFiltres(a, 'service') && parserServices(a.services).includes(service)).length
}

function basculerService(service: string) {
  const i = servicesActifs.value.indexOf(service)
  if (i === -1) servicesActifs.value.push(service)
  else servicesActifs.value.splice(i, 1)
}

const PAGE_SIZE = 20
const page = ref(Number(route.query.page) || 1)

// Un changement de filtre revient à la page 1
watch([search, filtreDept, servicesActifs], () => {
  page.value = 1
}, { deep: true })

// Reflète l'état (page + filtres) dans l'URL pour le restaurer au retour navigateur
watch([search, filtreDept, servicesActifs, page], () => {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.q = search.value.trim()
  if (filtreDept.value.trim()) query.dept = filtreDept.value.trim()
  if (servicesActifs.value.length) query.services = servicesActifs.value.join(',')
  if (page.value > 1) query.page = String(page.value)
  router.replace({ query })
}, { deep: true })

const totalPages = computed(() => Math.ceil(associationsFiltrees.value.length / PAGE_SIZE))
// Borne la page si l'URL restaurée dépasse le nombre de pages disponibles
const pageActuelle = computed(() => Math.min(Math.max(page.value, 1), Math.max(totalPages.value, 1)))
const associationsPaginees = computed(() => associationsFiltrees.value.slice((pageActuelle.value - 1) * PAGE_SIZE, pageActuelle.value * PAGE_SIZE))

function scrollTop() {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div>

    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-20 text-center" style="background: linear-gradient(160deg, #f0fdf4 0%, #f0f9ff 40%, #fdf4ff 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 20% 50%, rgba(74,222,128,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(99,102,241,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-4xl mx-auto px-6">
        <div class="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 text-gray-700 text-sm font-medium mb-8">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
          {{ associations.length }} associations référencées
        </div>
        <h1 class="text-5xl sm:text-6xl font-black text-gray-900 mb-5 tracking-tight leading-tight">
          Associations<br>
          <span style="background: linear-gradient(90deg, #4ade80 0%, #60a5fa 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">TSA en France</span>
        </h1>
        <p class="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
          Associations de familles, de personnes concernées et de professionnels spécialisés dans les troubles du spectre autistique.
        </p>
        <NuxtLink to="/associations/suggerer" class="inline-flex items-center gap-2 px-6 py-3 mt-8 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors">
          + Suggérer une association
        </NuxtLink>
      </div>
    </section>

    <!-- CONTENU -->
    <section class="bg-gray-50 py-12">
      <div class="max-w-5xl mx-auto px-6">

        <!-- RECHERCHE -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
              <input
                v-model="search"
                type="search"
                aria-label="Rechercher une association par nom, ville, département ou service"
                placeholder="Nom, ville, département, service…"
                class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
              />
            </div>
            <!-- Liste nommée plutôt qu'un champ où taper un numéro de mémoire :
                 « 7 » ne donnait rien, ni « Gironde ». Limitée aux départements
                 qui ont réellement une association, avec leur nombre. -->
            <select
              v-model="filtreDept"
              aria-label="Filtrer par département"
              class="w-full sm:w-64 px-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
            >
              <option value="">Tous les départements</option>
              <option v-for="d in departementsDisponibles" :key="d.num" :value="d.num">
                {{ d.nom }} ({{ d.num }}) — {{ d.n }}
              </option>
            </select>
          </div>

          <!-- Services : le même test que pour « fait des bilans » côté
               praticiens — une mauvaise réponse fait-elle perdre du temps à
               une famille qui cherche précisément ce service ? « Autre »,
               104 occurrences mais aucune information, n'est pas retenu. -->
          <div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              v-for="s in SERVICES_ASSOCIATIONS"
              :key="s"
              type="button"
              :aria-pressed="servicesActifs.includes(s)"
              :disabled="compteService(s) === 0 && !servicesActifs.includes(s)"
              class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :class="servicesActifs.includes(s) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              @click="basculerService(s)"
            >
              {{ s }} <span class="tabular-nums opacity-60">{{ compteService(s) }}</span>
            </button>
          </div>
        </div>

        <!-- CHARGEMENT -->
        <div v-if="enChargement" class="text-center py-16 text-gray-500 text-sm">
          Chargement des associations…
        </div>

        <template v-else>
          <p class="text-sm font-semibold text-gray-600 mb-5 px-1">
            {{ associationsFiltrees.length }} association{{ associationsFiltrees.length > 1 ? 's' : '' }} trouvée{{ associationsFiltrees.length > 1 ? 's' : '' }}
            <span v-if="totalPages > 1"> — page {{ pageActuelle }} / {{ totalPages }}</span>
          </p>

          <div v-if="associationsFiltrees.length === 0" class="text-center py-16 text-gray-500">
            Aucune association pour ces critères.
          </div>

          <!-- LISTE -->
          <div v-else class="space-y-4">
            <article
              v-for="a in associationsPaginees"
              :key="a.id"
              class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200 p-6"
            >
              <NuxtLink :to="`/association/${a.id}`" class="block">
                <div class="flex items-start gap-4">

                  <!-- Avatar -->
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0" style="background: linear-gradient(135deg, #10b981, #059669)">
                    {{ initialesStructure(a.nom) }}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3 flex-wrap mb-1">
                      <h2 class="font-black text-gray-900 text-lg leading-tight">{{ a.nom }}</h2>
                      <span class="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg shrink-0">{{ a.departement }}</span>
                    </div>

                    <!-- Ville + type -->
                    <p class="text-gray-600 text-sm mb-3">
                      <span v-if="a.ville">{{ a.ville }} · </span>
                      <span v-if="a.type_association" class="text-gray-500">{{ a.type_association }}</span>
                    </p>

                    <!-- Services : parserServices() plutôt qu'un split() brut —
                         la donnée source contient des retours à la ligne au
                         milieu de certains libellés, qui s'affichaient sinon
                         coupés en deux lignes dans la pastille. -->
                    <div v-if="a.services" class="flex flex-wrap gap-1.5 mb-3">
                      <span
                        v-for="service in parserServices(a.services).slice(0, 4)"
                        :key="service"
                        class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                      >{{ service }}</span>
                    </div>

                    <!-- Age public -->
                    <p v-if="a.age_public" class="text-xs text-gray-500 mb-3">
                      <span class="font-semibold">Public :</span> {{ a.age_public }}
                    </p>

                    <!-- Description -->
                    <p v-if="a.description" class="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {{ a.description }}
                    </p>
                  </div>
                </div>
              </NuxtLink>

              <!-- Contacts hors du lien : un lien dans un lien est du HTML
                   invalide, et privait la carte de son intitulé pour un lecteur
                   d'écran. -->
              <div v-if="a.telephone || a.email || a.site_web" class="flex flex-wrap gap-3 pt-4 mt-4 border-t border-gray-100">
                <a v-if="a.telephone" :href="`tel:${a.telephone}`" class="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  📞 {{ a.telephone }}
                </a>
                <a v-if="a.email" :href="`mailto:${a.email}`" class="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors min-w-0">
                  ✉️ <span class="truncate max-w-[200px]">{{ a.email }}</span>
                </a>
                <a v-if="a.site_web" :href="a.site_web" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
                  🔗 Site web
                </a>
              </div>
            </article>
          </div>

          <!-- PAGINATION -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button type="button"
              :disabled="pageActuelle === 1"
              class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-gray-400 transition-colors"
              @click="page = pageActuelle - 1; scrollTop()"
            >← Précédent</button>
            <div class="flex gap-1 flex-wrap justify-center">
              <template v-for="p in totalPages" :key="p">
                <button type="button"
                  v-if="p === 1 || p === totalPages || (p >= pageActuelle - 2 && p <= pageActuelle + 2)"
                  class="w-9 h-9 rounded-lg text-sm font-semibold border transition-colors"
                  :class="p === pageActuelle ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'"
                  @click="page = p; scrollTop()"
                >{{ p }}</button>
                <span v-else-if="p === pageActuelle - 3 || p === pageActuelle + 3" class="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
              </template>
            </div>
            <button type="button"
              :disabled="pageActuelle === totalPages"
              class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-gray-400 transition-colors"
              @click="page = pageActuelle + 1; scrollTop()"
            >Suivant →</button>
          </div>
        </template>

      </div>
    </section>

  </div>
</template>
