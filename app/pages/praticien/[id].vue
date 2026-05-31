<script setup lang="ts">
import type { Praticien } from '~/types/index'
import { initiales, isNew } from '~/composables/usePraticien'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const { fetchPraticien, confirmerFiche } = useApi()

// « Retour à l'annuaire » : rejoue l'historique si on vient du site
// (restaure pagination + position de défilement), sinon va à l'accueil.
function retourAnnuaire() {
  const prev = import.meta.client ? (window.history.state?.back as string | undefined) : undefined
  if (prev && prev.startsWith('/')) router.back()
  else router.push('/')
}

const { data, status } = await useAsyncData(`praticien-${id}`, () => fetchPraticien(id), {
  server: false
})

const praticien = computed<Praticien | null>(() => data.value?.[0] ?? null)

useSeoMeta({
  title: computed(() => praticien.value ? `${praticien.value.nom} — Annuaire TSA` : 'Fiche praticien — Annuaire TSA'),
  description: computed(() => praticien.value ? `${praticien.value.type} spécialisé TSA à ${praticien.value.ville}` : '')
})

const alreadyVoted = ref(false)
const voteCount = ref(0)
const voteThanks = ref(false)
const copied = ref(false)
const shareUrl = computed(() => encodeURIComponent(import.meta.client ? window.location.href : ''))
let copiedTimer: ReturnType<typeof setTimeout> | null = null

function partager() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => copied.value = false, 2000)
}

onUnmounted(() => { if (copiedTimer) clearTimeout(copiedTimer) })

onMounted(() => {
  alreadyVoted.value = localStorage.getItem(`verified_${id}`) === '1'
  if (praticien.value) voteCount.value = praticien.value.confirmations
})

watch(praticien, (val) => {
  if (val) voteCount.value = val.confirmations
})

async function confirmer() {
  if (alreadyVoted.value) return
  alreadyVoted.value = true
  voteThanks.value = true
  localStorage.setItem(`verified_${id}`, '1')
  voteCount.value++
  try {
    await confirmerFiche(id)
  } catch {
    // Rollback silencieux : la confirmation locale reste mais le serveur a échoué
    voteCount.value--
    localStorage.removeItem(`verified_${id}`)
    alreadyVoted.value = false
    voteThanks.value = false
  }
}
</script>

<template>
  <div>

    <!-- CHARGEMENT / ERREUR -->
    <section v-if="status === 'pending'" class="bg-gray-50 min-h-screen flex justify-center items-center py-16">
      <svg class="animate-spin text-gray-400 w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </section>

    <section v-else-if="status === 'error' || !praticien" class="bg-gray-50 min-h-screen py-16">
      <div class="max-w-3xl mx-auto px-6">
        <button type="button" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium" @click="retourAnnuaire">
          ← Retour à l'annuaire
        </button>
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          Fiche introuvable. Ce praticien n'existe pas ou a été supprimé.
        </div>
      </div>
    </section>

    <template v-else>

      <!-- EN-TÊTE PRATICIEN -->
      <section class="relative overflow-hidden py-14" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
        <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
        <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.07) 0%, transparent 60%)" />

        <div class="relative max-w-4xl mx-auto px-6">
          <button type="button" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-8 transition-colors font-medium" @click="retourAnnuaire">
            ← Retour à l'annuaire
          </button>

          <div class="flex items-start gap-6">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl shrink-0 shadow-lg" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
              {{ initiales(praticien.nom) }}
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-3 flex-wrap mb-2">
                <h1 class="text-3xl font-black text-gray-900">{{ praticien.nom }}</h1>
                <span v-if="isNew(praticien.created_at)" class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">● Nouveau</span>
              </div>
              <p class="text-gray-500 text-lg mb-4">
                {{ praticien.type }} · {{ praticien.ville }}
                <NuxtLink :to="`/departement/${praticien.departement}`" class="hover:text-indigo-600 transition-colors">({{ praticien.departement }})</NuxtLink>
              </p>
              <div class="flex flex-wrap gap-2">
                <span v-for="age in praticien.ages" :key="age" class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full border border-indigo-200">{{ age }}</span>
                <span v-if="praticien.teleconsultation" class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200">Téléconsultation</span>
                <span v-if="praticien.delai" class="px-3 py-1 text-sm font-medium rounded-full border" :class="praticien.delai === 'Disponible' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'">
                  Délai : {{ praticien.delai }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CONTENU -->
      <section class="bg-gray-50 py-10">
        <div class="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-5">

          <!-- COLONNE PRINCIPALE -->
          <div class="sm:col-span-2 space-y-5">

            <!-- Notes -->
            <div v-if="praticien.notes" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-base">📝</div>
                Informations complémentaires
              </h2>
              <div class="notes-content text-gray-600 text-sm leading-relaxed" v-html="praticien.notes" />
            </div>

            <!-- Confirmations -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">👥</div>
                Avis de la communauté
              </h2>
              <div class="flex items-center gap-4 mb-4">
                <div class="text-4xl font-black text-emerald-600">{{ voteCount }}</div>
                <div>
                  <div class="font-semibold text-gray-900">confirmation{{ voteCount > 1 ? 's' : '' }}</div>
                  <div class="text-sm text-gray-500">Des familles ont vérifié cette fiche</div>
                </div>
              </div>
              <button
                :disabled="alreadyVoted"
                class="w-full py-2.5 border-2 rounded-xl font-semibold text-sm transition-colors"
                :class="alreadyVoted ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'"
                @click="confirmer"
              >
                {{ alreadyVoted ? '✓ Confirmé' : '✓ Confirmer cette fiche' }}
              </button>
              <p v-if="voteThanks" class="text-sm text-emerald-600 mt-3 text-center">Merci pour votre confirmation !</p>
            </div>

          </div>

          <!-- COLONNE LATÉRALE -->
          <div class="space-y-5">

            <!-- Contact -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base">📞</div>
                Contact
              </h2>
              <a v-if="praticien.telephone" :href="`tel:${praticien.telephone}`" class="flex items-center gap-3 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors mb-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-sm">📞</div>
                {{ praticien.telephone }}
              </a>
              <p v-else class="text-sm text-gray-400 mb-3">Téléphone non renseigné</p>
              <a v-if="praticien.site_web" :href="praticien.site_web" target="_blank" rel="noopener" class="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 transition-colors text-sm">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-sm">🔗</div>
                Site web / Doctolib
              </a>
              <div v-if="praticien.adeli" class="flex items-center gap-3 text-gray-500 text-sm mt-3">
                <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm">🪪</div>
                <span>N° ADELI : {{ praticien.adeli }}</span>
              </div>
            </div>

            <!-- Localisation -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">📍</div>
                Localisation
              </h2>
              <p class="text-gray-600 text-sm mb-3">
                {{ [praticien.adresse, praticien.ville, praticien.departement ? `(${praticien.departement})` : ''].filter(Boolean).join(', ') || 'Adresse non renseignée' }}
              </p>
              <NuxtLink :to="`/departement/${praticien.departement}`" class="inline-flex items-center gap-1.5 text-indigo-600 text-sm hover:text-indigo-700 transition-colors font-medium">
                Voir tous les praticiens du {{ praticien.departement }} →
              </NuxtLink>
            </div>

            <!-- Partager -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-base">🔗</div>
                Partager
              </h2>
              <div class="flex items-center gap-3">
                <a
                  :href="`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`"
                  target="_blank"
                  rel="noopener"
                  aria-label="Partager sur Facebook"
                  title="Partager sur Facebook"
                  class="w-11 h-11 rounded-xl bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <UIcon name="i-simple-icons-facebook" class="w-5 h-5" />
                </a>
                <button
                  aria-label="Copier le lien de la fiche"
                  title="Copier le lien"
                  class="flex-1 h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  @click="partager"
                >
                  <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-link'" class="w-4 h-4" />
                  {{ copied ? 'Lien copié !' : 'Copier le lien' }}
                </button>
              </div>
            </div>

            <!-- Signaler -->
            <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
              <NuxtLink :to="`/signaler?id=${praticien.id}`" class="inline-flex items-center justify-center gap-2 text-sm text-amber-700 hover:text-amber-900 transition-colors font-medium">
                <UIcon name="i-lucide-flag" class="w-4 h-4" />
                Signaler une erreur sur cette fiche
              </NuxtLink>
            </div>

          </div>
        </div>
      </section>

    </template>

  </div>
</template>

<style scoped>
/* Aère les blocs des « Informations complémentaires » (notes en v-html) */
.notes-content :deep(p) {
  margin-bottom: 0.9rem;
}
.notes-content :deep(p:last-child) {
  margin-bottom: 0;
}
.notes-content :deep(strong) {
  display: block;
  color: #4f46e5;
  font-weight: 600;
  margin-bottom: 0.15rem;
}
.notes-content :deep(a) {
  color: #4f46e5;
  text-decoration: underline;
}
</style>
